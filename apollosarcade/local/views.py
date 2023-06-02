from django.shortcuts import render

# Create your views here.
def local(request):
    app = request.path.split('/')[1]
    return render(request, f'{app}_local.html',)