from apollosarcade.utils import get_games, game_archival
from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from game.models import GameInstruction
from apollosarcade.encoders import QuillFieldEncoder

# Create your views here.
def check_for_lobbies(request):
    # current_user = get_player(request)
    lobbies = get_games(request,['LOBBY','READY','IN-GAME','COMPLETED'],exclude_status=['ARCHIVE'])
    if (len(lobbies) >= 1):
        for lobby in lobbies:
            if lobby.status == 'COMPLETED' and ((lobby.p1_status == 'POST' and lobby.p2_status == 'POST') or (lobby.p1_status == 'REMATCH' and lobby.p2_status == 'POST') or (lobby.p1_status == 'POST' and lobby.p2_status == 'REMATCH')):
                return 2
            elif lobby.status == 'COMPLETED' and ((lobby.p1_status == 'POST' and lobby.p2_status == 'ABANDONED') or (lobby.p1_status == 'ABANDONED' and lobby.p2_status == 'POST')):
                game_archival(request, lobby['game_id'])
                return 0
        return 1
    else:
        return 0

def check_for_match(request):
    app = request.path.split('/')[1]
    url = f'{app}/'
    games = get_games(request,['LOBBY','READY','IN-GAME','COMPLETED'],exclude_status=['ARCHIVE'])
    match (check_for_lobbies(request)):
        case 2:
            url += f'post/{games[0].game_id}'
        case 1:
            url += f'lobby/{games[0].game_id}'
        case 0:
            url += 'start'
    match = {}
    match.update({
        'pathname': url,
    })
    return JsonResponse(match, safe=False)

def how_to_play(request):
    try:
        # Extract game name slug from the path, e.g., /magic15/how-to-play/ -> 'magic15'
        path_parts = request.path.strip('/').split('/')
        if len(path_parts) >= 2 and path_parts[-1] == 'how-to-play':
            game_name_slug = path_parts[-2] # e.g., 'magic15'

            # Map URL slug to the exact title stored in GameInstruction
            # *** Adjust this map as needed for your games ***
            game_title_map = {
                'magic_fifteen': 'Magic 15',
                'capture': 'Capture',
                # Add other game slugs and their corresponding titles here
            }
            target_title = game_title_map.get(game_name_slug)

            if not target_title:
                raise Http404(f"Instructions title mapping not found for game slug: '{game_name_slug}'")

            # Fetch instructions using the mapped title
            # Use get_object_or_404 for cleaner handling if not found
            instructions = get_object_or_404(GameInstruction, title=target_title)

            how_to_play_data = {
                'title': instructions.title,
                # Assuming 'content' is the QuillField, access its HTML representation
                'instructions': instructions.content.html if hasattr(instructions.content, 'html') else str(instructions.content)
            }
            return JsonResponse(how_to_play_data, safe=False, encoder=QuillFieldEncoder)
        else:
            # Handle cases where the URL structure is not as expected
            raise Http404("Invalid URL format for how-to-play request.")

    # Catch specific exceptions for better error handling
    except GameInstruction.DoesNotExist:
        # This is handled by get_object_or_404, but kept for clarity if you switch back to .get()
        raise Http404(f"Instructions not found for title: '{target_title}'")
    except Http404 as e:
        # Re-raise Http404 exceptions to let Django handle them
        raise e
    except Exception as e:
        # Log unexpected errors (replace print with proper logging in production)
        print(f"Error in how_to_play view: {e}")
        return JsonResponse({'error': 'An internal server error occurred.'}, status=500)