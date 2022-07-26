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

