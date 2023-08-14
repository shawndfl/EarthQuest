# EarthQuest

This is a RPG puzzle game with a very simple story.

## Folder Layout

This is an over view of the src folder and what is contained in them.

- assets - Are png, mp4, and json data used in the game.
- components - Are game components low level visual game elements that are used to make up the game.
- controllers - Are class the manage behavior.
- manager - Are classes that manage multiple controllers or components
- data - Are classes the manage the model data and re usually interfaces
- helper - Are support classes. They don't hold state except for some cached calculations

## Notes

The workflow for building a level is, first, use the editor to create a level.

The editor will be used to create worlds, each world can have up to 100 levels and each level can have up to a 100 X 100 grid. This is not ideal for find a good balance between levels and level sizes.

### Prime features

We want the user to be able to jump in and play the level quickly allowing them to test things out then jump back into editing.

Add auto save feature that saves a level to cache. The game data can also be downloaded locally as well.

Support auto load from the cache to pick up where you left off. And allow for loading a local json file as well.

### Secondary features

Undo/ redo or placing tiles and setting the tile type.

Add an edit feature that shows an edit icon in the top right corner of the tile your mouse is over. When clicked a pop up will allow you to edit the tile's type.

Set world properties that allow user to set grid size and level count. The user also needs to be able to see the world name and edit it.

Allow the user to create a new world from a `portal` type.
