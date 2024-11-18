from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

# Custom User Manager for SYgtway
class SYgtwayManager(BaseUserManager):
    def create_user(self, cmpid, logid, password=None, **extra_fields):
        if not cmpid:
            raise ValueError('The cmpid field is required')
        if not logid:
            raise ValueError('The logid field is required')

        user = self.model(cmpid=cmpid, logid=logid, **extra_fields)

        # Automatically assign logcmpid
        user.logcmpid = f"{cmpid.cmpname}_{user.pk}"  # Assuming cmpid has a cmpid attribute

        # Use set_password to hash the password
        user.set_password(password)
        user.logpwd = user.password  # Store the hashed password in logpwd
        user.save(using=self._db)
        return user

    def create_superuser(self, cmpid, logid, password=None, **extra_fields):
        if not logid:
            raise ValueError('The logid field is required for superuser creation')

        # Fetch or create the SYgtway1 instance
        sygtway_instance = SYgtway1.objects.get_or_create(cmpid=cmpid)[0]

        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        # Create the user and automatically set logcmpid
        user = self.create_user(sygtway_instance, logid, password=password, **extra_fields)
        user.logcmpid = f"{sygtway_instance.cmpname}{user.pk}"  # Set logcmpid
        user.save(using=self._db)  # Save to update the user with logcmpid
        return user

# SYgtway Table as Custom User Model
class SYgtway(AbstractBaseUser, PermissionsMixin):
    cmpid = models.ForeignKey('SYgtway1', on_delete=models.CASCADE)  # Foreign key to the SYgtway1 table
    logid = models.CharField(max_length=50)
    logcmpid = models.CharField(max_length=50, unique=True, null=True)  # Automatically populated
    logpwd = models.CharField(max_length=128)  # Store hashed password here
    login = models.DateTimeField(null=True, blank=True)
    logout = models.DateTimeField(null=True, blank=True)
    lcked = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'logcmpid'
    REQUIRED_FIELDS = ['cmpid', 'logid']  # 'logid' is still a required field

    objects = SYgtwayManager()

    def __str__(self):
        return self.logid

    class Meta:
        db_table = 'SYgtway'  # Set the database table name explicitly
        verbose_name = 'User'  # Singular name
        verbose_name_plural = 'Users'  # Plural name

    # Override set_password to store hashed password in logpwd
    def set_password(self, raw_password):
        super().set_password(raw_password)
        self.logpwd = self.password  # Store the hashed password in logpwd

# SYgtway1 table (Company Details)
class SYgtway1(models.Model):
    name = models.CharField(max_length=100)
    cmpid = models.CharField(max_length=50, primary_key=True)
    cmpname = models.CharField(max_length=100)
    schname = models.CharField(max_length=50)
    dbusr = models.CharField(max_length=50)
    dbpwd = models.CharField(max_length=50)
    dbname = models.CharField(max_length=50)
    cmpstatus = models.CharField(max_length=50)

    def __str__(self):
        return self.cmpname

    class Meta:
        db_table = 'SYgtway1'  # Set the database table name explicitly
        verbose_name = 'Company'  # Singular name
        verbose_name_plural = 'Companies'  # Plural name
