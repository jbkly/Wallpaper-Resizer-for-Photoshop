#target photoshop

function saveRename() {
  if(!documents.length) return; // early return if no document is open
  app.preferences.rulerUnits = Units.PIXELS;

  // get original image info
  var img = app.activeDocument;
  var width, height;
  var imgTitle = img.info.title || img.name.substr(0, img.name.lastIndexOf('.')) || 'image';

  // prompt for filename stem
  var nameStem = prompt("What do you want to name this image? (resolution will be appended)", imgTitle, "Choose Filename");
  if (!nameStem) return alert('Canceled'); // break out of script if no name is chosen

  // set 'export for web' file-save options
  var saveOpts = new ExportOptionsSaveForWeb();
  saveOpts.format = SaveDocumentType.JPEG;
  saveOpts.quality = 100;
  var saveLocationBase = 'C:\\Dropbox\\Wallpapers\\';
  var originalsFolder = saveLocationBase + 'Originals (larger than 1080p)\\';
  var folder1920x1080 = saveLocationBase + '1920x1080 (16x9)\\';
  var folder2560x1600 = saveLocationBase + '2560x1600 (16x10)\\';

  var savedOriginal = false;
  var saved1920x1080 = false;
  var saved2560x1600 = false;

  handleAllSizes();

  // main logic function (recursive)
  function handleAllSizes() {

    // get image dimensions
    getImageDimensions();

    // case 0: Image is less than 1920x1080: toss it
    if (width < 1920 || height < 1080) {
      return alert('Image is too small for a wallpaper (less than 1920x1080)');

    // case 1: Image is 2560x1600: label resolution and save it
    } else if (width === 2560 && height === 1600 && !saved2560x1600) {

      saveToLocation(folder2560x1600);
      saved2560x1600 = true;

      handleAllSizes();

    // case 2: Image is 1920x1080: label resolution and save it (done)
    } else if (width === 1920 && height === 1080) {

      if (!saved1920x1080) {
        saveToLocation(folder1920x1080);
        saved1920x1080 = true;
      }
      if (saved1920x1080) img.close();

    // case 3: Image is at least 2560x1600
    } else if (width >= 2560 && height >= 1600 && !saved2560x1600) {

      if (!savedOriginal) saveToLocation(originalsFolder);
      savedOriginal = true;

      var ratio = 16/10;

      if (width / height <= ratio) {
        img.resizeImage(UnitValue(2560, 'px'), undefined, undefined, ResampleMethod.BICUBIC);
      } else {
        img.resizeImage(undefined, UnitValue(1600, 'px'), undefined, ResampleMethod.BICUBIC);
      }
      getImageDimensions();
      if (width / height != ratio) cropResize('2560x1600');

      handleAllSizes();

    // case 4: Image is at least 1920x1080
    } else if (width >= 1920 && height >= 1080) {

      if (!savedOriginal) saveToLocation(originalsFolder);
      savedOriginal = true;

      var ratio = 16/9;

      if (width / height <= ratio) {
        img.resizeImage(UnitValue(1920, 'px'), undefined, undefined, ResampleMethod.BICUBIC);
      } else {
        img.resizeImage(undefined, UnitValue(1080, 'px'), undefined, ResampleMethod.BICUBIC);
      }
      getImageDimensions();
      img.resizeCanvas(UnitValue(width, 'px'), UnitValue(height, 'px'));
      if (width / height != ratio) cropResize('1920x1080');

      handleAllSizes();

    } else {
      return alert('Error, not sure what to do with this ' + width + 'x' + height + ' image');
    }
  }

  // helper functions
  function cropResize(resolution) {
    alert('Select ' + resolution + ' crop');
    doAction('Crop' + resolution, 'Crop & Resize');
  }

  function saveToLocation(saveLocation) {
    getImageDimensions();
    var fileName = new File(saveLocation + nameStem + '[' + width + 'x' + height + ']' + '.jpg');
    var saved = img.exportDocument (fileName, ExportType.SAVEFORWEB, saveOpts);
    return alert('Saved ' + width + 'x' + height + ' image to ' + saveLocation);
  }

  function getImageDimensions() {
    width = parseInt(img.width.toString().replace(' px', ''), 10);
    height = parseInt(img.height.toString().replace(' px', ''), 10);
  }
}

// loop through open files
while (documents.length > 0) {
  saveRename();
}
