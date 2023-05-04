from django.urls import path
from . import views

urlpatterns = [
    path('profiles/', views.UserProfileList.as_view(), name='userprofile_list'),
    path('profiles/<int:pk>/', views.UserProfileDetail.as_view(), name='userprofile_detail'),
]
