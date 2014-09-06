
File.contentUpdated = function() {
  this.updateIcon();
};

File.justCreated = function() {
  if (!this.getAttribute('hasContent'))
    this.upload();
  
  // Update the previous (x,y) coordinates.
  this.setAttribute("xPrev", this.getAttribute("x"));
  this.setAttribute("yPrev", this.getAttribute("y"));
};

File.openFile = function() {
  window.open(this.getContentURL(), "_blank");
};

/**
* @return {undefined}
*/
File.isPreviewable = function() {
  return GUI.mimeTypeIsPreviewable(this.getAttribute("mimeType"));
};

File.upload = function() {
  GUI.uploadFile(this, this.translate(GUI.currentLanguage, "Please select a file"));
};