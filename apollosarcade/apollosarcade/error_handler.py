class LobbyError(Exception):
    def __init__(self, message):
        self.message = message

class GameError(Exception):
    def __init__(self, message):
        self.message = message

class PostError(Exception):
    def __init__(self, message):
        self.message = message