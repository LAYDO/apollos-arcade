from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.contrib.auth.models import User
from user_profiles.models import UserProfile
from .email_utils import send_email
import os

def home(request):
    return render(request, 'home.html')

def verify_email(request, verification_code):
    try:
        user_profile = get_object_or_404(UserProfile,verification_code=verification_code)
        if timezone.now() > user_profile.verification_code_expires_at:
            return render(request, 'registration/verification_failure.html')
        
        user_profile.email_verified = True
        user_profile.verification_code = None
        user_profile.verification_code_expires_at = None
        user_profile.save()
        return render(request, 'registration/verification_success.html')
    except UserProfile.DoesNotExist:
        return render(request, 'registration/verification_failure.html')
    
def request_new_verification_link(request):
    if request.method == 'POST':
        email = request.POST['email']
        user = User.objects.filter(email=email).first()
        if user:
            profile = user.userprofile
            profile.generate_verification_code()
            profile.save()

            # Send verification email
            sender = os.environ.get('GMAIL_SENDER', None)
            recipient = email
            subject = 'Apollo\'s Arcade Email Verification'
            body = f"Please verify your email by clicking this link: https://www.apollosarcade.com/verify/{profile.verification_code}"
            send_email(sender, recipient, subject, body)
            return JsonResponse({'status': 'success'})
        else:
            return JsonResponse({'status': 'error', 'message': 'User not found'})
    else:
        return render(request, 'registration/request_new_verification_link.html')
