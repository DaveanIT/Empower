from django.db import connection
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from .models import SYgtway1
from .utils import switch_tenant_db
from .dbswitch import update_db_settings
from django.db import connections
import pyodbc
User = get_user_model()
GLOBAL_VARS = {}




class VerifyTenant(APIView):
    # No authentication required for this endpoint
    permission_classes = []

    def post(self, request, *args, **kwargs):
        print("View initialized")

        db_settings = connections['default'].settings_dict
        print("Fetch branch db:", db_settings['NAME'])
        update_db_settings('MPOWER_TEST')
        tenant_name = request.data.get("tenant_name")
        if not tenant_name:
            return Response({"error": "Tenant name is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Check if the tenant name exists in the SYgtway1 table
            tenant_exists = SYgtway1.objects.filter(name=tenant_name).exists()
            if tenant_exists:
                return Response({"message": "Tenant exists"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Tenant does not exist"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class CustomAuthToken(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, tenant_name, *args, **kwargs):
        logid = request.data.get("username")
        logpwd = request.data.get("password")
        # print(request.data)

        # Store values in a global variable (not recommended for multi-user use)
        # db_settings = connections['default'].settings_dict
        # print(db_settings)
        GLOBAL_VARS['logid'] = logid
        GLOBAL_VARS['tenant_name'] = tenant_name

        # Get tenant instance (do not switch the database yet)
        tenant = get_object_or_404(SYgtway1, name=tenant_name)
        
        try:
            # Authenticate user in the default database
            u = User.objects.all().values()

            # print(u)
            user = User.objects.get(cmpid_id=tenant.cmpid, logid=logid)
            print('user tokens generating for ',user)

            # Check if the password is correct
            if user.check_password(logpwd):
                
                # Generate JWT tokens
                access_token = AccessToken.for_user(user)
                refresh_token = RefreshToken.for_user(user)

                # Switch tenant database
                switch_tenant_db(tenant)

                # Access database connection settings using Django's ORM
                db_settings = connections['default'].settings_dict

                # Use the settings from the default connection
                conn = pyodbc.connect(
                    f"DRIVER={{SQL Server Native Client 11.0}};"
                    f"SERVER={db_settings['HOST']};"
                    f"DATABASE={db_settings['NAME']};"
                    f"UID={db_settings['USER']};"
                    f"PWD={db_settings['PASSWORD']};"
                )

                cursor = conn.cursor()

                # Execute the stored procedure with parameters
                cursor.execute("""
                    EXEC usp_LogUsr ?, ?
                """, (tenant_name, logid))

                result = cursor.fetchall()
                print(db_settings['NAME'])
                print(db_settings['NAME'])
                # print(tenant_name, logid)
                # print(result)

                # Get the column names from cursor.description
                column_names = [column[0] for column in cursor.description]
                response_data = {}

                # Check if there is any result
                if result:
                    
                    # Iterate over the result set dynamically, using column names
                    for row in result:
                        for idx, value in enumerate(row):
                            # Add column name as key and value as the corresponding value
                            response_data[column_names[idx]] = str(value)

                # Execute stored procedure
                update_db_settings('MPOWER_TEST')

                # Return the tokens
                return Response({
                    'access': str(access_token),
                    'refresh': str(refresh_token),
                    'userData':response_data,
                }, status=status.HTTP_200_OK)
            else:
                # Invalid password
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        except User.DoesNotExist:
            # User not found
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class FetchBranchDetails(APIView):
    permission_classes = [IsAuthenticated]
    print('Branch Authenticated')
    authentication_classes = [JWTAuthentication]
    print('Branch JWT Authenticated')
    

    def post(self, request, *args, **kwargs):
        try:
            print("View initialized")

            db_settings = connections['default'].settings_dict
            print("Fetch branch db:", db_settings['NAME'])
            update_db_settings('MPOWER_TEST')

            db_settings = connections['default'].settings_dict
            print("Fetch branch db:", db_settings['NAME'])
            

            cmpid = request.data.get("cmpid")
            userid = request.data.get("userid")
            print("cmpid:", cmpid, "\nuserid:", userid)

            # Verify JWT authenticated user
            user = request.user  
            print("Authenticated User:", user)
            # update_db_settings('MPOWER_TEST')   
                    
            company = SYgtway1.objects.get(cmpid=cmpid)
            print(f"Company Name: {company.cmpname}") 
            switch_tenant_db(company)

            # Attempt database connection
            try:
                conn = pyodbc.connect(
                    f"DRIVER={{SQL Server Native Client 11.0}};"
                    f"SERVER={db_settings['HOST']};"
                    f"DATABASE={db_settings['NAME']};"
                    f"UID={db_settings['USER']};"
                    f"PWD={db_settings['PASSWORD']};"
                )
                print("Database connection established.")
            except Exception as conn_error:
                print("Database connection failed:", conn_error)
                return Response({"error": "Database connection failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            cursor = conn.cursor()
            try:
                cursor.execute("EXEC usp_LogUsrBranch ?, ?", (cmpid, userid))
                result = cursor.fetchall()
                print("Stored procedure executed successfully.")
            except Exception as sp_error:
                print("Error executing stored procedure:", sp_error)
                return Response({"error": "Stored procedure execution failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Process result
            column_names = [column[0] for column in cursor.description]
            response_data = []
            for row in result:
                row_data = {column_names[idx]: str(value) for idx, value in enumerate(row)}
                response_data.append(row_data)

            return Response({'branchDetails': response_data}, status=status.HTTP_200_OK)

        except Exception as e:
            print("An error occurred:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DashboardDataView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, *args, **kwargs):
        try:
            # Update the DB settings to the desired tenant database
            db_settings = connections['default'].settings_dict
            print("Dashboard DB:", db_settings['NAME'])
            

            cmpid = request.data.get("cmpid")
            userid = request.data.get("userid")
            branchcode = request.data.get("branchcode")
            print("cmpid:", cmpid, "\nuserid:", userid, "\nbranchcode",branchcode)

            # Verify JWT authenticated user
            user = request.user  
            print("Authenticated User:", user)
            # update_db_settings('MPOWER_TEST')   
                    
            company = SYgtway1.objects.get(cmpid=cmpid)
            print(f"Company Name: {company.cmpname}") 
            switch_tenant_db(company)   
            
            # Set up database connection using settings
            conn = pyodbc.connect(
                f"DRIVER={{SQL Server Native Client 11.0}};"
                f"SERVER={db_settings['HOST']};"
                f"DATABASE={db_settings['NAME']};"
                f"UID={db_settings['USER']};"
                f"PWD={db_settings['PASSWORD']};"
            )
            print("Database connection established for dashboard data.",db_settings['NAME'])

            cursor = conn.cursor()

            # Execute the stored procedure `usp_Dashbrd`
            # Replace '1, 1, TP01' with parameters as needed
            cursor.execute("EXEC usp_Dashbrd ?, ?, ?", (userid, cmpid, branchcode))
            result = cursor.fetchall()
            print("Stored procedure `usp_Dashbrd` executed successfully.")

            # Retrieve column names for the response
            column_names = [column[0] for column in cursor.description]
            dashboard_data = []

            # Process each row in the result set
            for row in result:
                row_data = {column_names[idx]: str(value) for idx, value in enumerate(row)}
                dashboard_data.append(row_data)

            # Close cursor and connection
            cursor.close()
            conn.close()

            # Return dashboard data
            return Response({'dashboardData': dashboard_data}, status=status.HTTP_200_OK)

        except Exception as e:
            print("An error occurred while fetching dashboard data:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Retrieve and blacklist the refresh token
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            # No need to delete auth_token, since JWT is used for authentication
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserMenuView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, *args, **kwargs):
        try:
            cmpid = request.data.get("cmpid")
            userid = request.data.get("userid")
            parentid = request.data.get("parentId")

            # Verify JWT authenticated user
            user = request.user
            print("Authenticated User:", user)
            
            # Get tenant information and switch to the appropriate database
            company = SYgtway1.objects.get(cmpid=cmpid)
            print(f"Company Name: {company.cmpname}")
            switch_tenant_db(company)

            # Set up database connection using Django's connection settings
            db_settings = connections['default'].settings_dict
            conn = pyodbc.connect(
                f"DRIVER={{SQL Server Native Client 11.0}};"
                f"SERVER={db_settings['HOST']};"
                f"DATABASE={db_settings['NAME']};"
                f"UID={db_settings['USER']};"
                f"PWD={db_settings['PASSWORD']};"
            )
            print("Database connection established for user menu data.", db_settings['NAME'])

            cursor = conn.cursor()

            # Execute the stored procedure `usp_LogUsrMenu`
            cursor.execute("EXEC usp_LogUsrMenu ?, ?, ?", (cmpid, userid, parentid))
            result = cursor.fetchall()
            print("Stored procedure `usp_LogUsrMenu` executed successfully.")

            # Retrieve column names for the response
            column_names = [column[0] for column in cursor.description]
            menu_data = []

            # Process each row in the result set
            for row in result:
                row_data = {column_names[idx]: str(value) for idx, value in enumerate(row)}
                menu_data.append(row_data)

            # Close cursor and connection
            cursor.close()
            conn.close()

            # Return the menu data
            return Response({'menuData': menu_data}, status=status.HTTP_200_OK)

        except Exception as e:
            print("An error occurred while fetching user menu data:", e)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
