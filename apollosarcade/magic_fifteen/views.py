from django.shortcuts import render
from django import template
from lobby.base_views import BaseCreateLobbyView, BaseJoinLobbyView, BaseLobbyView
from apollosarcade.utils import get_app_model
from guest.models import Guest
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from apollosarcade.error_handler import LobbyError

register = template.Library()

def magic_fifteen(request):
    return render(request, 'magic_fifteen_home.html',)

class CreateLobbyView(BaseCreateLobbyView):
    def create_game_instance(self, Game, current_user, form_data):
        return Game(
            status='LOBBY',
            player_one=current_user,
            player_two=None,
            round=0,
            winner=0,
            loser=0,
            privacy=form_data['create'],
            password=form_data['create_option'],
            plays=[],
            spaces=[0,0,0,0,0,0,0,0,0],
        )

class JoinLobbyView(BaseJoinLobbyView):
    def get_game_instance(self, Game, form_data):
        if form_data['join'] == 'Lobby Number':
            try:
                return Game.objects.get(game_id=form_data['join_option'])
            except Game.DoesNotExist:
                raise LobbyError("Lobby not found!")
        else:
            games = Game.objects.filter(status='LOBBY').exclude(status='REMATCH')
            if games.exists():
                return games.first()
            else:
                raise LobbyError("No lobbies found!")
            
    def can_join_game(self, game, current_user, form_data):
        if game.status == 'REMATCH':
            raise LobbyError("This lobby is currently in a rematch, please join another lobby")
        if game.privacy == 'Public':
            return True
        elif game.privacy == 'Private':
            if form_data['password'] == game.password:
                return True
            elif not form_data['password']:
                raise LobbyError("Password is required to join this lobby")
            else:
                raise LobbyError("Incorrect password")
        else:
            raise LobbyError("Invalid lobby privacy setting")
        
class LobbyView(BaseLobbyView):
    def get_lobby_context(self, game, current_user, app):
        if game.player_one == current_user:
            player2_username = self.get_player_username(game.player_two)
            return self.build_lobby_context(game, current_user.username, player2_username, current_user.id, game.player_two_object_id, current_user)
        elif game.player_two == current_user:
            player1_username = self.get_player_username(game.player_one)
            return self.build_lobby_context(game, player1_username, current_user.username, game.player_one_object_id, current_user.id, current_user)
        else:
            raise LobbyError("You are not a player in this lobby!")
        
    def get_player_username(self, player):
        if player is None:
            return 'Waiting for a player...'
        elif player.__class__ == User:
            return player.username
        elif player.__class__ == Guest:
            return player.username
        else:
            return 'Unknown Player'
        
    def build_lobby_context(self, game, player1_username, player2_username, player1_id, player2_id, current_user):
        return {
            'id': game.game_id,
            'status': game.status,
            'p1': player1_username,
            'p2': player2_username,
            'p1ID': player1_id or 0,
            'p2ID': player2_id or 0,
            'p1Status': game.p1_status,
            'p2Status': game.p2_status,
            'privacy': game.privacy,
            'pw': game.password,
            'current': current_user.id,
            'round': game.round,
        }
