---
title: "Conway's Game of Life"
collection: projects
type: "Workshop"
permalink: /projects/GoL
date: 2023-08-18
location: "Vancouver BC, Canada"
toc: true
toc_label: "Table of Contents"
toc_icon: "cog"
---

John Conway's Game of Life is a cellular automation, zero-player game devised by the british mathematician John Horton Conway. This means that the "player" decides the initial state of the board and once the game begins the board evolves based on it's own set of rules. 

The board in the Game of Life is constructed of a rectangular grid of square cells, where each cell can be treated as alive or dead. Every cell has information about the current state of it's 8 neighboring cells at the current time step, which dictates what the cells state will be in the next time step based on the following rules:

1. Any live cell with two or three live neighbours survives.
2. Any dead cell with three live neighbours becomes a live cell.
3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.

[https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

The Following is my application of this Game of Life and the steps i took to build it.

![](images\GoL.gif)



# The Start
The Process can be broken down into 3 parts
1. build an interactive grid
2. apply the updating logic to play the Game of Life
3. add buttons to provide the user some interactivity

As a starting point I used this pygame template for setting up a simple game [template](http://programarcadegames.com/python_examples/f.php?file=pygame_base_template.py).

The template is fairly self explanitory but here's a quick explanation of it's logic:

First they import pygame and define some global variables that represent the RGB values of colors they want to use.

~~~~python
import pygame

# Define some colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
~~~~

Then in the call function they initialize pygame, setup the dimensions of the pygame display they want to use, create the display object named screen and give the screen a name. They also set any initial flags the pygame will use: for example the done flag controls the exit behaviour of our main loop. They also start a clock in order to control the framerate/update speed of the main loop.

~~~~python
if __name__ == '__main__':

    pygame.init()

    # Set the width and height of the screen [width, height]
    size = (700, 500)
    screen = pygame.display.set_mode(size)

    pygame.display.set_caption("My Game")

    # Loop until the user clicks the close button.
    done = False

    # Used to manage how fast the screen updates
    clock = pygame.time.Clock()

~~~~

Then they start the main event loop. Everytime the event loop loops it checks for if the quit event was triggered, if it was then it sets the done flag and our main loop will end and pygame will run it's quit command. In other cases we would then have code for updating our games variables, and code for redrawing the screen to match the games new state. 

clock.tick(60) controls the maximum framerate of our loop causing a delay in execution until 1/60th of a second has passed. 

pygame.display.flip() fully updates the screen, pygame.display.update() will also do this but update has the ability to update specified objects instead of the entire screen causing it to be faster in other applications.

~~~~python
 while not done:
        # --- Main event loop
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                done = True

        # --- Game logic should go here

        # --- Screen-clearing code goes here

        # Here, we clear the screen to white. Don't put other drawing commands
        # above this, or they will be erased with this command.

        # If you want a background image, replace this clear with blit'ing the
        # background image.
        screen.fill(WHITE)

        # --- Drawing code should go here

        # --- Go ahead and update the screen with what we've drawn.
        pygame.display.flip()

        # --- Limit to 60 frames per second
        clock.tick(60)

    # Close the window and quit.
    pygame.quit()
~~~~



# Building the Grid

Modifying the template our first goal is to create an interactive grid.

![a simple interactive grid](images\interactive_grid.gif)

## Drawing the grid
First we want to initialize a 2 dimensional array that will represent the cells in our grid. Since cells can only be in 1 of 2 states (alive or dead) it makes sense to use binary values 1 and 0 to represent if a cell is alive or dead. Using np.zeros we create an nxm 2d array of zeros.
~~~python
def init_grid(dimx, dimy):
    cells = np.zeros((dimy, dimx))
    return cells
~~~ 

once we have a grid we are free to 

~~~python
width = 20
height = 20
margin = 5
~~~



~~~~python
# --- Screen-clearing code goes here
# If you want a background image, replace this clear with blit'ing the
# background image.
screen.fill(BLACK)

# --- Drawing code should go here

for r, c in np.ndindex(grid.shape):
    if not grid[r, c]:
        pygame.draw.rect(screen, WHITE,
                            (c * (width + margin) + margin, r * (width + margin) + margin, width, height))
    else:
        pygame.draw.rect(screen, GREEN,
                            (c * (width + margin) + margin, r * (width + margin) + margin, width, height))
~~~~


## interacting with the gid



## Bounding the Grid


## Updating the Grid


# Adding Buttons


# The complete code
Complete code can be found here:
[github](https://github.com/amunwes/Game-of-life)

# Where to go from here
