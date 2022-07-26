import json
import re
from turtle import *


def x_coordinates_mapper(x, x_size):
    x = x-(x_size/2)
    return x


def y_coordinates_mapper(y, y_size):
    y = -(y-(y_size/2))
    return y


with open("Dungeon_1.dungeondraft_map", "r") as file:
    world = json.load(file)["world"]
    width = world["width"] * 256
    height = world["height"] * 256
    walls = world["levels"]["0"]["walls"]

listen()
screensize(canvwidth=width, canvheight=height)
s = getscreen()
turtle = Turtle()
turtle.speed(0)
for wall in walls:
    coordinates = [int(number) for number in re.findall(r"([0-9]+).? ", wall["points"])]
    start_coordinates = coordinates[:2]
    wall_coordinates = coordinates[2:]
    turtle.penup()
    turtle.goto(x_coordinates_mapper(start_coordinates[0], width), y_coordinates_mapper(start_coordinates[1], height))
    turtle.pendown()
    while len(coordinates) != 0:
        turtle.goto(x_coordinates_mapper(coordinates[0], width), y_coordinates_mapper(coordinates[1], height))
        coordinates = coordinates[2:]
    if wall["loop"]:
        turtle.goto(x_coordinates_mapper(start_coordinates[0], width),
                    y_coordinates_mapper(start_coordinates[1], height))

done()