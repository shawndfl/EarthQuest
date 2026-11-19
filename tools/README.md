# Aseprite tools

## Sprite sheet to frames

`sprite-sheet-to-frames.lua` converts a transparency-separated sprite sheet
into an animation with one detected region per Aseprite frame. It reads the
active frame of the open sheet and combines its visible layers before
extracting frames.

To install and use it:

1. In Aseprite, choose **File > Scripts > Open Scripts Folder**.
2. Copy `sprite-sheet-to-frames.lua` into that folder.
3. Choose **File > Scripts > Rescan Scripts Folder**.
4. Open a sprite sheet, then choose **File > Scripts > sprite-sheet-to-frames**.
5. Enter the playback duration, then click **Convert**.

The script creates a new, unsaved sprite. The source sheet is not modified.
Fully transparent rows separate frame rows, and fully transparent columns
within each row separate individual frames. Frames are imported from top to
bottom and left to right. Their transparent outer padding is removed, and the
largest detected frame determines the new animation's canvas size; smaller
frames are placed at its top-left corner.
