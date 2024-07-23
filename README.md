# Polygonal Cropper
With this app, you draw a polygon over an image. Only the inner area of the polygon will be visible in the resulting image. The parts of the image that lie outside of the polygon will be removed. The functionality of this app is similar to the **Polygonal Lasso tool** of **Adobe Photoshop**.

After launching the app, the first thing to do is click the **Open image** button and then select your desired image file in the Browse dialog box that appears. Then you'll see another screen which displays the image in the left panel and lets you specify the polygonal area that is to be cropped from the image.

The top status bar allows you to **zoom the image** and **change its viewing opacity**. Also, the status bar shows **the cursor position** (with coordinates relative to the top left corner of the image) as you move the mouse across the image.

## Specifying the polygonal area manually
One way to specify the polygonal area is to manually define its vertices by giving coordinates. In the right panel, there is a table that lists the vertices of the polygon and is initially empty. Use the **Add** button above the table to add a new record to the table, which represents a vertex. The x- and y-coordinates of the new record are initially set such that the vertex is positioned in the middle of the image. To modify the coordinates, double click a cell in the **X** or **Y** columns, so a text field appears within the cell. Type your desired x- or y-coordinate in the field, and then press Enter to apply the change. Note that as you make changes to the **Polygon Vertices** table, the polygon shape corresponding to the table data is displayed over the left-hand image with a red outline.

If you need to remove one or more records from the **Polygon Vertices** table, you can use the **Remove** button above the table. The table allows you to select a single record by simply clicking on one of its rows. It also allows to select multiple records by holding down **Ctrl** key and clicking on each desired row. After selecting the records of interest, click the **Remove** button to remove them. Moreover, there is a **Clear** button which removes all the records of the table.

## Drawing a polygon with mouse
If the manual method to specify the polygon is impractical or too dificult, you can easily draw the polygon using mouse, just like the *Pen Tool in Adobe Illustrator* does. To do so, you must make a series of mouse clicks over the image in the left panel to insert each vertex of the polygon. (Note that the **Polygon Vertices** table must be empty to start drawing a polygon using mouse.) After you inserted the last vertex, you can do either of the following to "close" the polygon shape (so a straight line is drawn from the last vertex to the starting point):

- Simply use your mouse to join the last vertex to the starting point. Note that the cursor must change to **a circle with plust sign** when your mouse hovers the starting point, so that you can then click to join the points.
- Press **Enter** on the keyboard.
- Make the last vertex with a double click instead of a single click, so that the polygon gets closed automatically after insertion of the vertex.

**Note:** While drawing, if you feel like the partial polygon that you have drawn is not satisfying, you can press **Esc** key to discard it and start over.

**Note:** While drawing the polygon, you can press and hold down the **Shift** key to draw the current edge orthogonally. This will force the edge to be either horizontal or vertical exactly.

It's good to know that, there are more user-friendly ways to adjust the polygon vertices, rather than modifying their coordinates directly in the right-hand table, as previously described.

One way is to select a single vertex in the right-hand table, then move your mouse somewhere on the left-hand image and click there. Then the selected vertex, along with its two adjucent edges, jumps onto the current cursor position. Note that this method won't work if multiple vertices are selected in the table.

Another way is to select one or more vertices in the right-hand table, and then use **the arrow keys** on keyboard to move the selected vertices either up, down, left, or right. This is especially useful when the polygon and its vertices need to be highly precise.

## Cropping the image
After you finished specifying the polygonal area, click the **Crop** button at the bottom of the right panel, in order to begin processing the image. Then the app will display another screen, where you can watch the progress bar and wait until the operation is completed.

There is a text field where you can enter the file path where the resultant image is to be stored. After the operation is completed, click the **Save** button below the text field to finally save the resultant image.
