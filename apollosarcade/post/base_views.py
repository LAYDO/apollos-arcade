from django.http import HttpResponseRedirect, JsonResponse
from django.views import View
from django.shortcuts import render
from apollosarcade.utils import get_player, get_player_by_content_type, game_archival, get_games, get_app_model
from apollosarcade.error_handler import PostError

class BasePostView(View):
    def get(self, request, game_id):
        app = request.path.split('/')[1]
        current_user = get_player(request)
        post = {}
        lobbies = get_games(request, ['LOBBY','REMATCH'], [])
        Game = get_app_model(request, 'game')
        try:
            if len(lobbies) > 0:
                return HttpResponseRedirect(f'/{app}/lobby')
            game = Game.objects.get(game_id=game_id)
            post = self.build_post_context(app, current_user, game, post)
            print(post)
            return render(request, f'{app}_post.html', post)
        except Game.DoesNotExist:
            raise PostError("Game not found!")
        except PostError as e:
            return JsonResponse({"error": str(e)}, status=400)

    def build_post_context(self, app, current_user, game, post):
        """
        This method should be overriden by subclasses to 
        set the winner and loser of the game.
        """
        raise NotImplementedError("Subclasses must implement set_winner_loser.")
