import json
import re
from turtle import *

def map_coordinates(x, y, x_size, y_size):
    x = x-(x_size/2)

with open("test.dungeondraft_map", "r") as file:
    world = json.load(file)["world"]
    width = world["width"] * 256
    height = world["height"] * 256
    walls = world["levels"]["0"]["walls"]

listen()
screensize(canvwidth=width, canvheight=height)
s = getscreen()
turtle = Turtle()
for wall in walls:
    coordinates = [int(number) for number in re.findall(r"([0-9]+).? ", wall["points"])]
    turtle.penup()
    turtle.goto(coordinates[0]-1024, coordinates[1]-1024)
    turtle.pendown()
    turtle.forward(100)
done()