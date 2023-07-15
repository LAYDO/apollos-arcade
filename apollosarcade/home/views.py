from apollosarcade.utils import get_games, game_archival
from django.http import JsonResponse
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
    how_to_play = {}
    instructions = GameInstruction.objects.get(id=1)
    how_to_play['title'] = instructions.title
    how_to_play['instructions'] = instructions.content
    quill_field_data = how_to_play["instructions"].html
    how_to_play["instructions"] = quill_field_data
    return JsonResponse(how_to_play, safe=False, encoder=QuillFieldEncoder)