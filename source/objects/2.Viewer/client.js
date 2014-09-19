/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */

Viewer.justCreated = function () {
  // Without this line, the drag and drop functionality will
  // only work once the second document is dropped on the viewer...
  this.setAttribute("file", "0");
};

/**
 * Creates a fake document for this viewer. This function is used
 * to enable drag and drop support from the reference container to
 * the viewer.
 * 
 * @param {String} documentId   The id of the document (object)
 * @returns {Object}  The fake object
 */
Viewer.createFakeHiddenFile = function (documentId) {
  var fakeObject = {id: documentId, type: "HiddenFile", isFake: true};

  fakeObject.getAttribute = function (key) {
    return fakeObject[key];
  };

  fakeObject.setAttribute = function (key, value) {
    fakeObject[key] = value;
  };

  return fakeObject;
};

/**
 * Retrieves a fake hidden file for this viewer with all information from the database.
 * 
 * @param {String}    hiddenFileId   The id of the document (object)
 * @param {Function}  callback        A callback where the fake object is passed to.
 * @returns {undefined}
 */
Viewer.getFakeHiddenFile = function (hiddenFileId, callback) {
  DBManager.query({type: "HiddenFile", id: hiddenFileId, mimeType: "text/html"}, "objects", function (objects) {
    if (objects.length > 0 && callback) {
      var fakeObject = objects[0];
      fakeObject.isFake = true;

      fakeObject.getAttribute = function (key) {
        return fakeObject[key];
      };

      fakeObject.setAttribute = function (key, value) {
        fakeObject[key] = value;
      };

      callback(fakeObject);
    }
  });
};

/**
 * Retrieves a fake document for this viewer with all information from the database by a given
 * file id.
 * 
 * @param {String}   fileId       The id of the file object, the hidden file belongs to.
 * @param {Function} callback     A callback where the fake object is passed to.
 * @returns {undefined}
 */
Viewer.getFakeHiddenFileByFile = function (fileId, callback) {
  DBManager.query({type: "HiddenFile", belongsTo: fileId, mimeType: "text/html"}, "objects", function (objects) {
    if (objects.length > 0 && callback) {
      var fakeObject = objects[0];
      fakeObject.isFake = true;

      fakeObject.getAttribute = function (key) {
        return fakeObject[key];
      };

      fakeObject.setAttribute = function (key, value) {
        fakeObject[key] = value;
      };

      callback(fakeObject);
    }
  });
};
