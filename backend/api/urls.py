from django.urls import path
from .views import VerifyTenant,CustomAuthToken,FetchBranchDetails,DashboardDataView,LogoutView, UserMenuView

urlpatterns = [
    path('<str:tenant_name>/api/token/', CustomAuthToken.as_view(), name='token_obtain'),
    path('VerifyTenant/', VerifyTenant.as_view(), name='VerifyTenant'),
    path('branch/', FetchBranchDetails.as_view(), name='FetchBranchDetails'),
    path('dashboard/', DashboardDataView.as_view(), name='dashboard'),
    path('menu/', UserMenuView.as_view(), name='menu'),
    path('logout/', LogoutView.as_view(), name='logout'),
]
