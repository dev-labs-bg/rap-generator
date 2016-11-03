from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^upload$', views.upload, name='upload'),
    url(r'^beats$', views.beats, name='beats'),
    url(r'^tts$', views.tts, name='tts'),
    url(r'^text-to-rap$', views.textToRap, name='textToRap'),
]