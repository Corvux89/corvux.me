const overlayRow = document.getElementById("overlay-row")

export class Overlay {
    constructor(
        public type: string = "",
        public target: string = "",
        public radius: string = "",
        public center: string = "",
        public size: string = "",
        public start: string = "",
        public end: string = "",
        public length: string = "",
        public width: string = "",
        public topleft: string = "",
        public color: string = ""
    ) { }

    load(overlay) {
        return new Overlay(
            overlay.type,
            overlay.target,
            overlay.radius,
            overlay.center,
            overlay.size,
            overlay.start,
            overlay.end,
            overlay.length,
            overlay.width,
            overlay.topleft,
            overlay.color
        )
    }
}

