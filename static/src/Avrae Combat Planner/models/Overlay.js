const overlayRow = document.getElementById("overlay-row");
export class Overlay {
    constructor(type = "", target = "", radius = "", center = "", size = "", start = "", end = "", length = "", width = "", topleft = "", color = "") {
        this.type = type;
        this.target = target;
        this.radius = radius;
        this.center = center;
        this.size = size;
        this.start = start;
        this.end = end;
        this.length = length;
        this.width = width;
        this.topleft = topleft;
        this.color = color;
    }
    load(overlay) {
        return new Overlay(overlay.type, overlay.target, overlay.radius, overlay.center, overlay.size, overlay.start, overlay.end, overlay.length, overlay.width, overlay.topleft, overlay.color);
    }
}
