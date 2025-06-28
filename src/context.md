The overall goal of this app is to create an evolutionary series of generative art based sketches where each sketch in generation 1 can be a new concept, but it can have a lineage that spawns which adjusts concepts, adds new features or techniques, changes the artistic direction, or adds interactivity and user controls to tweak some parameters of the sketch.  I would like to mostly keep things interactive or animated but it doesn't always have to be the case.  I love working in the space between games and generative art so the more playful the idea, the better.

Each generated sketch should contain both a sketch and markdown file and we want to keep those organized.  These are currently maintained via projects.js and sketches.js which should also be updated.  Markdown files live in public/blog by generation.  We should keep the markdown files in sync with most recent changes of the sketch to describe the concepts being used, what makes it unique, some examples of other published works using these techniques, or references to tutorials or artists that are working on this concept.  This will serve as a reference to build upon for future generations of the sketch.  On these posts, there is no need to be overly technical in providing many code blocks but it should be dense with descriptions, artistic direction, techniques, unique features, source material, and examples of this type of work.

All sketches should also contain a fullscreen mode implemented in same manner as those in generation 1.

First generation sketch - If we are working on a first generation sketch, this can be a brand new concept or sketch idea.  It should exist in /sketches/gen1/ and it should have a markdown created in public/blog/gen1.  Updates should be made to import the sketch and markdown into the app.

Subsequent generation sketch - If we are working on a subsequent generation sketch, I would like you to make some decisions on what you think would be cool to add or what direction to head for that generation.  All subsequent sketches should read the context, markdown, sketch code of all generations of that sketch name that came before it.  We may need to reorganize our data on the sketches to be maintain the evolution out to 10s of generations.

generationOptions in Home.jsx also needs to be updated if we create a new generation.
markdowns should go into public/blog/{generationVersion}

Your role will be the creative visionary of the evolutionary concepts.  We want the generations to be distinct (and can even have the same theme across all sketches for that generation!) and make substantive additions to the prior generation.  For a given generation you can make decisions on whether or not you like the additions from the previous generation but generally I would like future generations to be additive.

Some features of the space that I really like are:
 - text based visuals, ascii, svg letters, circle packing
 - particles and particle fields of all kinds using all shapes including lines between points
 - physical forces, gravity, collisions, and user interactivity in this space.
 - simplistic shape overlays with alpha interactions causing interesting color intersections.

Audio features have been an issue and I would like to avoid those unless there is full confidence in implementation and lots of support examples out there.