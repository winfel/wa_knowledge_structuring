/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

Viewer.justCreated = function() {
  // Without this line, the drag and drop functionality will
  // only work once the second document is dropped on the viewer...
  this.setAttribute("file", "0");
};