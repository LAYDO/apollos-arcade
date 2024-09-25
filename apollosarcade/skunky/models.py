from django.db import models
from game.models import GameModel
from django.contrib.postgres.fields import ArrayField


# Create your models here.
class Game(GameModel):
    plays = ArrayField(ArrayField(models.IntegerField(blank=True), default=list))
    cribs = ArrayField(ArrayField(models.IntegerField(blank=True), default=list))
    start_cards = ArrayField(models.IntegerField(blank=True), default=list)
    player_one_hands = ArrayField(ArrayField(models.IntegerField(blank=True), default=list))
    player_two_hands = ArrayField(ArrayField(models.IntegerField(blank=True), default=list))
    player_one_count = models.IntegerField(default=0)
    player_two_count = models.IntegerField(default=0)

    def calculate_points(self, hand, starter_card):
        # Calculate points for a given hand
        points = 0
        points += self.calculate_fifteens(hand, starter_card)
        points += self.calculate_pairs(hand, starter_card)
        points += self.calculate_runs(hand, starter_card)
        return points

    def calculate_fifteens(self, hand, starter_card):
        # Calculate points for fifteens in a hand
        points = 0
        # +2 if whole hand is 15
        if sum(hand) == 15:
            points += 2
        elif sum(hand) > 15:
            # +2 for each pair of cards that sum to 15
            for i in range(0, 4):
                for j in range(i+1, 4):
                    if hand[i] + hand[j] == 15:
                        points += 2
            # +2 for each set of 3 cards that sum to 15
            for i in range(0, 3):
                for j in range(i+1, 3):
                    for k in range(j+1, 4):
                        if hand[i] + hand[j] + hand[k] == 15:
                            points += 2
        return points

    def calculate_pairs(self, hand, starter_card):
        # Calculate points for pairs in a hand
        points = 0
        # +2 for each pair of cards
        for i in range(0, 4):
            for j in range(i+1, 4):
                if hand[i] == hand[j]:
                    points += 2
        return points

    def calculate_runs(self, hand, starter_card):
        # Return points for runs in a hand
        # Combine hand and starter card
        combined = hand + [starter_card]
        # Sort the hand
        combined.sort()
        # Check for runs of 3, 4, 5, double runs of 3 or 4, triple run of 3
        if combined[0] + 1 == combined[1] and combined[1] + 1 == combined[2]:
            if combined[2] + 1 == combined[3] and combined[3] + 1 == combined[4]:
                # Run of 5
                return 5
            elif combined[2] + 1 == combined[3] and combined[3] + 1 != combined[4]:
                # Run of 4
                return 4
            elif combined[2] == combined[3]:
                # Double run of 3
                return 6
            else:
                # Run of 3
                return 3
