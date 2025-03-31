# lobby/base_views.py

from django.views import View
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType

from apollosarcade.utils import get_player, get_app_model
from apollosarcade.error_handler import LobbyError
from guest.models import Guest
from home.views import check_for_lobbies
from .forms import CreateLobbyForm, JoinLobbyForm


class BaseCreateLobbyView(View):
    def post(self, request):
        if check_for_lobbies(request):
            return
        app = request.path.split("/")[1]
        form = CreateLobbyForm(request.POST)
        current_user = get_player(request)
        Game = get_app_model(request, "game")
        if form.is_valid():
            form_data = form.cleaned_data
            game = self.create_game_instance(Game, current_user, form_data)
            game.save()
            return JsonResponse({"redirect": f"/{app}/lobby/{game.game_id}"})
        else:
            return JsonResponse({"error": "Invalid form data"}, status=400)

    def create_game_instance(self, Game, current_user, form_data):
        """
        This method should be overridden by subclasses to create a game instance
        with application-specific fields.
        """
        raise NotImplementedError("Subclasses must implement create_game_instance.")


class BaseJoinLobbyView(View):
    def post(self, request):
        if check_for_lobbies(request) > 0:
            return
        try:
            app = request.path.split("/")[1]
            form = JoinLobbyForm(request.POST)
            current_user = get_player(request)
            Game = get_app_model(request, "game")
            if form.is_valid():
                form_data = form.cleaned_data
                game = self.get_game_instance(Game, form_data)
                if self.can_join_game(game, current_user, form_data):
                    self.add_player_to_game(game, current_user)
                    game.save()
                    return JsonResponse({"redirect": f"/{app}/lobby/{game.game_id}"})
                else:
                    raise LobbyError("Cannot join the game.")
            else:
                return JsonResponse({"error": "Invalid form data"}, status=400)
        except LobbyError as e:
            return JsonResponse({"error": str(e)}, status=400)

    def get_game_instance(self, Game, form_data):
        """
        This method should be overridden by subclasses to return the game instance
        based on form data.
        """
        raise NotImplementedError("Subclasses must implement get_game_instance.")

    def can_join_game(self, game, current_user, form_data):
        """
        Checks if the current user can join the game.
        """
        raise NotImplementedError("Subclasses must implement can_join_game.")

    def add_player_to_game(self, game, current_user):
        """
        Adds the current user to the game.
        """
        if game.player_one is None:
            game.player_one = current_user
        elif game.player_two is None:
            game.player_two = current_user
        else:
            raise LobbyError("The lobby is full.")


class BaseLobbyView(View):
    def get(self, request, game_id):
        current_user = get_player(request)
        app = request.path.split("/")[1]
        Game = get_app_model(request, "game")
        try:
            game = Game.objects.get(game_id=game_id)
            lobby_context = self.get_lobby_context(game, current_user, app)
            return render(request, f"{app}_lobby.html", lobby_context)
        except Game.DoesNotExist:
            raise LobbyError("Lobby not found!")
        except LobbyError as e:
            return JsonResponse({"error": str(e)}, status=400)

    def get_lobby_context(self, game, current_user, app):
        """
        This method should be overridden by subclasses to provide lobby context
        specific to the application.
        """
        raise NotImplementedError("Subclasses must implement get_lobby_context.")
