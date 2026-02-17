import { marked } from "marked";
// Map zoom and scale constants
const MAP_SCALE_MIN = 1;
const MAP_SCALE_MAX = 16;
const MAP_ZOOM_TARGET = 13;
const LABEL_SCALE_MIN = 0.3;
const LABEL_SCALE_MAX = 1;
const BUTTON_ZOOM_STEP = 1;
const mapImage = document.getElementById("solace-map-image");
const markersContainer = document.getElementById("solace-map-markers");
const modal = document.getElementById("solace-map-modal");
const modalTitle = document.getElementById("solace-map-modal-title");
const modalDescription = document.getElementById("solace-map-modal-description");
const modalMeta = document.getElementById("solace-map-modal-meta");
const modalClose = document.getElementById("solace-map-modal-close");
const mapStage = document.getElementById("solace-map-stage");
const mapViewport = document.getElementById("solace-map-viewport");
const searchInput = document.getElementById("solace-map-search");
const searchResults = document.getElementById("solace-map-search-results");
const searchToggle = document.getElementById("solace-map-search-toggle");
const searchPanel = document.getElementById("solace-map-search-panel");
const labelsToggle = document.getElementById("solace-map-labels-toggle");
if (!mapImage ||
    !markersContainer ||
    !mapStage ||
    !mapViewport ||
    !modal ||
    !modalTitle ||
    !modalDescription ||
    !modalMeta ||
    !modalClose ||
    !searchPanel ||
    !searchToggle ||
    !labelsToggle) {
    throw new Error("Solace map page is missing required elements.");
}
const formatPercent = (value) => `${value}%`;
const buildMetaLine = (point) => {
    const parts = [point.subtitle, point.region, point.subRegion].filter(Boolean);
    return parts.join(" · ");
};
const normalizeSearchText = (text) => {
    const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "is", "are"]);
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "") // Remove punctuation
        .split(/\s+/) // Split into words
        .filter((word) => word && !stopWords.has(word)) // Remove empty strings and stop words
        .join(" ");
};
const updatePanel = (point) => {
    if (!point) {
        modalTitle.textContent = "Old World";
        modalDescription.innerHTML = "Select a location marker to learn more.";
        modalMeta.textContent = "";
        return;
    }
    modalTitle.textContent = point.name;
    Promise.resolve(marked.parse(point.description || "")).then((html) => {
        modalDescription.innerHTML = html;
    });
    modalMeta.textContent = buildMetaLine(point);
};
const setModalOpen = (open) => {
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) {
        modal.removeAttribute("hidden");
    }
    else {
        modal.setAttribute("hidden", "");
    }
};
const setSearchOpen = (open) => {
    searchPanel.classList.toggle("is-open", open);
    searchPanel.setAttribute("aria-hidden", open ? "false" : "true");
    searchToggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
        searchInput?.focus();
    }
};
const initMap = async () => {
    let data = { points: [] };
    try {
        const response = await fetch("/static/json/solace_old_world_pois.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Failed to load POIs (${response.status}).`);
        }
        data = (await response.json());
    }
    catch (error) {
        console.error("Unable to load map data.", error);
    }
    if (data.mapSrc) {
        mapImage.src = data.mapSrc;
    }
    const points = Array.isArray(data.points) ? data.points : [];
    const pointById = new Map(points.map((point) => [point.id, point]));
    const markerById = new Map();
    const activeState = {
        id: null,
    };
    let recentTouch = false;
    let touchTracking = false;
    let touchMoved = false;
    let touchStartX = 0;
    let touchStartY = 0;
    const touchMoveThreshold = 8;
    const setActiveMarker = (marker, point) => {
        const markers = markersContainer.querySelectorAll(".solace-map-marker");
        markers.forEach((item) => item.classList.remove("is-active"));
        if (marker && point) {
            marker.classList.add("is-active");
            activeState.id = point.id;
            updatePanel(point);
            // Update URL hash for direct linking
            history.replaceState(null, "", `#${point.id}`);
        }
        else {
            activeState.id = null;
            updatePanel(null);
            // Clear hash when deselecting
            history.replaceState(null, "", window.location.pathname);
        }
    };
    const openModalForPoint = (point, marker) => {
        setActiveMarker(marker, point);
        if (point) {
            setModalOpen(true);
        }
        else {
            setModalOpen(false);
        }
    };
    points.forEach((point) => {
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "solace-map-marker";
        marker.style.left = formatPercent(point.x);
        marker.style.top = formatPercent(point.y);
        marker.setAttribute("aria-label", point.name);
        marker.setAttribute("data-name", point.name);
        marker.dataset.pointId = point.id;
        const ring = document.createElement("span");
        ring.className = "solace-map-marker-ring";
        marker.appendChild(ring);
        marker.addEventListener("mouseenter", () => updatePanel(point));
        marker.addEventListener("focus", () => updatePanel(point));
        marker.addEventListener("mouseleave", () => {
            if (activeState.id !== point.id) {
                updatePanel(activeState.id ? pointById.get(activeState.id) || null : null);
            }
        });
        marker.addEventListener("click", () => {
            if (recentTouch) {
                return;
            }
            if (activeState.id === point.id) {
                openModalForPoint(null, null);
            }
            else {
                openModalForPoint(point, marker);
            }
        });
        marker.addEventListener("touchstart", (event) => {
            touchTracking = true;
            touchMoved = false;
            touchStartX = event.touches[0]?.clientX ?? 0;
            touchStartY = event.touches[0]?.clientY ?? 0;
        }, { passive: true });
        marker.addEventListener("touchmove", (event) => {
            if (!touchTracking) {
                return;
            }
            const currentX = event.touches[0]?.clientX ?? 0;
            const currentY = event.touches[0]?.clientY ?? 0;
            if (Math.abs(currentX - touchStartX) > touchMoveThreshold || Math.abs(currentY - touchStartY) > touchMoveThreshold) {
                touchMoved = true;
            }
        }, { passive: true });
        marker.addEventListener("touchend", (event) => {
            event.preventDefault();
            event.stopPropagation();
            touchTracking = false;
            if (touchMoved) {
                return;
            }
            recentTouch = true;
            window.setTimeout(() => {
                recentTouch = false;
            }, 400);
            if (activeState.id === point.id) {
                openModalForPoint(null, null);
            }
            else {
                openModalForPoint(point, marker);
            }
        }, { passive: false });
        marker.addEventListener("touchcancel", () => {
            touchTracking = false;
        }, { passive: true });
        markersContainer.appendChild(marker);
        markerById.set(point.id, marker);
    });
    markersContainer.addEventListener("click", (event) => {
        const target = event.target;
        const marker = target?.closest(".solace-map-marker");
        const pointId = marker?.dataset.pointId;
        if (!pointId) {
            return;
        }
        const point = pointById.get(pointId) || null;
        openModalForPoint(point, marker || null);
    });
    markersContainer.addEventListener("touchend", (event) => {
        const target = event.target;
        const marker = target?.closest(".solace-map-marker");
        const pointId = marker?.dataset.pointId;
        if (!pointId) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (touchMoved) {
            return;
        }
        const point = pointById.get(pointId) || null;
        openModalForPoint(point, marker || null);
    }, { passive: false });
    updatePanel(null);
    setModalOpen(false);
    const panzoomFactory = window.panzoom ?? window.Panzoom;
    const panzoomInstance = panzoomFactory
        ? window.panzoom
            ? panzoomFactory(mapStage, {
                maxZoom: MAP_SCALE_MAX,
                minZoom: MAP_SCALE_MIN,
                zoomSpeed: 0.065,
                smoothScroll: false,
                bounds: true,
                boundsPadding: 0,
            })
            : panzoomFactory(mapStage, {
                maxScale: MAP_SCALE_MAX,
                minScale: MAP_SCALE_MIN,
                contain: "inside",
                smoothScroll: false,
                bounds: true,
                boundsPadding: 0,
            })
        : null;
    if (!panzoomInstance) {
        throw new Error("Panzoom is not available on this page.");
    }
    const getTransform = () => {
        if (panzoomInstance.getTransform) {
            return panzoomInstance.getTransform();
        }
        const scale = panzoomInstance.getScale?.() ?? 1;
        const pan = panzoomInstance.getPan?.() ?? { x: 0, y: 0 };
        return { x: pan.x ?? 0, y: pan.y ?? 0, scale };
    };
    const clampPan = () => {
        const transform = getTransform();
        const viewportRect = mapViewport.getBoundingClientRect();
        const baseWidth = mapStage.clientWidth || viewportRect.width;
        const baseHeight = mapStage.clientHeight || viewportRect.height;
        const scaledWidth = baseWidth * transform.scale;
        const scaledHeight = baseHeight * transform.scale;
        let nextX = transform.x;
        let nextY = transform.y;
        if (scaledWidth <= viewportRect.width) {
            nextX = (viewportRect.width - scaledWidth) / 2;
        }
        else {
            const minX = viewportRect.width - scaledWidth;
            nextX = Math.min(0, Math.max(minX, nextX));
        }
        if (scaledHeight <= viewportRect.height) {
            nextY = (viewportRect.height - scaledHeight) / 2;
        }
        else {
            const minY = viewportRect.height - scaledHeight;
            nextY = Math.min(0, Math.max(minY, nextY));
        }
        if (nextX !== transform.x || nextY !== transform.y) {
            panzoomInstance.moveTo?.(nextX, nextY);
        }
    };
    const syncZoomScale = () => {
        const transform = getTransform();
        const labelScale = Math.min(LABEL_SCALE_MAX, Math.max(LABEL_SCALE_MIN, 1 / Math.pow(transform.scale, 1.5)));
        mapViewport.style.setProperty("--map-zoom", transform.scale.toString());
        mapViewport.style.setProperty("--map-zoom-inv", (1 / transform.scale).toString());
        mapViewport.style.setProperty("--label-scale", labelScale.toString());
    };
    syncZoomScale();
    const syncAndClamp = () => {
        syncZoomScale();
        clampPan();
    };
    mapStage.addEventListener("panzoomchange", syncAndClamp);
    mapStage.addEventListener("panzoompan", syncAndClamp);
    mapStage.addEventListener("panzoomzoom", syncAndClamp);
    mapStage.addEventListener("panzoomend", syncAndClamp);
    const clampScale = (scale) => Math.min(MAP_SCALE_MAX, Math.max(MAP_SCALE_MIN, scale));
    const zoomToScale = (targetScale) => {
        const viewportRect = mapViewport.getBoundingClientRect();
        const centerX = viewportRect.width / 2;
        const centerY = viewportRect.height / 2;
        const clamped = clampScale(targetScale);
        const currentScale = getTransform().scale;
        if (panzoomInstance.smoothZoom) {
            const factor = clamped / currentScale;
            if (Math.abs(factor - 1) < 0.001) {
                return;
            }
            panzoomInstance.smoothZoom(centerX, centerY, factor);
            syncZoomScale();
            return;
        }
        if (clamped > currentScale) {
            panzoomInstance.zoomIn?.();
        }
        else if (clamped < currentScale) {
            panzoomInstance.zoomOut?.();
        }
        syncZoomScale();
    };
    const zoomWithWheel = (event) => {
        event.preventDefault();
        if (panzoomInstance.zoomWithWheel) {
            panzoomInstance.zoomWithWheel(event);
            return;
        }
        const delta = event.deltaY < 0 ? 0.1 : -0.1;
        const currentScale = getTransform().scale;
        zoomToScale(currentScale + delta);
    };
    mapViewport.addEventListener("wheel", zoomWithWheel, { passive: false });
    mapViewport.addEventListener("touchstart", (event) => {
        const target = event.target;
        if (target?.closest(".solace-map-marker")) {
            return;
        }
        event.preventDefault();
    }, { passive: false });
    mapViewport.addEventListener("touchmove", (event) => {
        const target = event.target;
        if (target?.closest(".solace-map-marker")) {
            return;
        }
        event.preventDefault();
    }, { passive: false });
    mapViewport.addEventListener("touchend", () => {
        syncZoomScale();
    }, { passive: true });
    const zoomToMarker = (point) => {
        const applyZoomAndPan = () => {
            const marker = markerById.get(point.id) || null;
            if (!marker) {
                return;
            }
            const viewportRect = mapViewport.getBoundingClientRect();
            const currentTransform = getTransform();
            const targetZoom = Math.max(currentTransform.scale, MAP_ZOOM_TARGET);
            // Get the marker's current screen position (relative to viewport)
            const markerRect = marker.getBoundingClientRect();
            const markerCenterX = markerRect.left + markerRect.width / 2;
            const markerCenterY = markerRect.top + markerRect.height / 2;
            // Calculate viewport center
            const viewportCenterX = viewportRect.left + viewportRect.width / 2;
            const viewportCenterY = viewportRect.top + viewportRect.height / 2;
            // Calculate how much to pan to center the marker
            const panDeltaX = viewportCenterX - markerCenterX;
            const panDeltaY = viewportCenterY - markerCenterY;
            // Apply pan to center the marker
            const newPanX = currentTransform.x + panDeltaX;
            const newPanY = currentTransform.y + panDeltaY;
            panzoomInstance.moveTo?.(newPanX, newPanY);
            syncZoomScale(); // Update after pan
            const factor = targetZoom / currentTransform.scale;
            if (panzoomInstance.smoothZoom && Math.abs(factor - 1) >= 0.001) {
                requestAnimationFrame(() => {
                    const updatedRect = marker.getBoundingClientRect();
                    const updatedCenterX = (updatedRect.left - viewportRect.left) + updatedRect.width / 2;
                    const updatedCenterY = (updatedRect.top - viewportRect.top) + updatedRect.height / 2;
                    if (panzoomInstance.smoothZoom) {
                        panzoomInstance.smoothZoom(updatedCenterX, updatedCenterY, factor);
                        // Poll for zoom completion
                        const checkZoomComplete = () => {
                            const currentScale = getTransform().scale;
                            if (Math.abs(currentScale - targetZoom) < 0.1) {
                                syncZoomScale();
                            }
                            else {
                                requestAnimationFrame(checkZoomComplete);
                            }
                        };
                        requestAnimationFrame(checkZoomComplete);
                    }
                });
            }
            else {
                syncZoomScale();
            }
        };
        requestAnimationFrame(applyZoomAndPan);
    };
    const toolbarButtons = document.querySelectorAll("[data-map-action]");
    toolbarButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.getAttribute("data-map-action");
            if (action === "zoom-in") {
                const currentScale = getTransform().scale;
                zoomToScale(currentScale + BUTTON_ZOOM_STEP);
            }
            if (action === "zoom-out") {
                const currentScale = getTransform().scale;
                zoomToScale(currentScale - BUTTON_ZOOM_STEP);
            }
            if (action === "reset") {
                // Directly set pan and zoom to reset state
                const viewportRect = mapViewport.getBoundingClientRect();
                const baseWidth = mapStage.clientWidth || mapImage.clientWidth || viewportRect.width;
                const baseHeight = mapStage.clientHeight || mapImage.clientHeight || viewportRect.height;
                const targetPanX = viewportRect.width / 2 - (baseWidth * MAP_SCALE_MIN) / 2;
                const targetPanY = viewportRect.height / 2 - (baseHeight * MAP_SCALE_MIN) / 2;
                panzoomInstance.moveTo?.(targetPanX, targetPanY);
                const currentScale = getTransform().scale;
                const factor = MAP_SCALE_MIN / currentScale;
                if (panzoomInstance.smoothZoom && Math.abs(factor - 1) >= 0.001) {
                    panzoomInstance.smoothZoom(viewportRect.width / 2, viewportRect.height / 2, factor);
                }
                syncZoomScale();
            }
        });
    });
    labelsToggle.addEventListener("click", () => {
        const isActive = mapViewport.classList.toggle("is-showing-labels");
        labelsToggle.classList.toggle("is-active", isActive);
        labelsToggle.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
    const renderSearchResults = (results) => {
        if (!searchResults) {
            return;
        }
        searchResults.innerHTML = "";
        results.forEach((point) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "solace-map-search-result";
            button.textContent = point.subtitle ? `${point.name} - ${point.subtitle}` : point.name;
            button.setAttribute("role", "option");
            button.addEventListener("click", () => {
                const marker = markerById.get(point.id) || null;
                setActiveMarker(marker, point);
                zoomToMarker(point);
                setSearchOpen(false);
                if (searchInput) {
                    searchInput.value = "";
                }
                searchResults.innerHTML = "";
            });
            searchResults.appendChild(button);
        });
    };
    const filterPoints = (query) => {
        const search = normalizeSearchText(query);
        if (!search) {
            renderSearchResults([]);
            return;
        }
        const scored = points
            .map((point) => {
            const normalizedName = normalizeSearchText(point.name);
            const haystack = normalizeSearchText([
                point.name,
                point.subtitle || "",
                point.description || "",
                point.region || "",
                point.subRegion || "",
            ].join(" "));
            if (!haystack.includes(search)) {
                return { point, score: -1 };
            }
            // Score based on where the match occurs
            let score = 0;
            if (normalizedName === search)
                score = 1000; // Exact name match
            else if (normalizedName.startsWith(search))
                score = 500; // Name starts with search
            else if (normalizedName.includes(search))
                score = 300; // Contains in name
            else
                score = 100; // Found in other fields
            return { point, score };
        })
            .filter((item) => item.score !== -1)
            .sort((a, b) => b.score - a.score)
            .map((item) => item.point);
        renderSearchResults(scored.slice(0, 8));
    };
    if (searchInput) {
        searchInput.addEventListener("input", () => filterPoints(searchInput.value));
        searchInput.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") {
                return;
            }
            event.preventDefault();
            const search = normalizeSearchText(searchInput.value);
            if (!search) {
                return;
            }
            const scored = points
                .map((point) => {
                const normalizedName = normalizeSearchText(point.name);
                const haystack = normalizeSearchText([
                    point.name,
                    point.subtitle || "",
                    point.description || "",
                    point.region || "",
                    point.subRegion || "",
                ].join(" "));
                if (!haystack.includes(search)) {
                    return { point, score: -1 };
                }
                let score = 0;
                if (normalizedName === search)
                    score = 1000;
                else if (normalizedName.startsWith(search))
                    score = 500;
                else if (normalizedName.includes(search))
                    score = 300;
                else
                    score = 100;
                return { point, score };
            })
                .filter((item) => item.score !== -1)
                .sort((a, b) => b.score - a.score)
                .map((item) => item.point);
            if (scored.length > 0) {
                const match = scored[0];
                zoomToMarker(match);
                renderSearchResults([]);
                setSearchOpen(false);
                searchInput.value = "";
            }
        });
    }
    searchToggle.addEventListener("click", () => {
        const isOpen = searchPanel.classList.contains("is-open");
        setSearchOpen(!isOpen);
    });
    modalClose.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openModalForPoint(null, null);
    });
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            event.preventDefault();
            event.stopPropagation();
            openModalForPoint(null, null);
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setSearchOpen(false);
            openModalForPoint(null, null);
        }
        // Override Ctrl+F / Cmd+F to open map search
        if ((event.ctrlKey || event.metaKey) && event.key === "f") {
            event.preventDefault();
            setSearchOpen(true);
        }
    });
    const enableCoordinatePicker = true;
    if (enableCoordinatePicker) {
        mapViewport.addEventListener("click", (event) => {
            const target = event.target;
            // Skip if clicking on a marker
            if (target?.closest(".solace-map-marker")) {
                return;
            }
            const rect = mapImage.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            const formatted = `${x.toFixed(2)}, ${y.toFixed(2)}`;
            console.log(formatted);
            navigator.clipboard?.writeText(formatted);
        });
    }
    // Handle URL hash for direct links to POIs
    const handleHash = () => {
        const hash = window.location.hash.slice(1); // Remove '#'
        if (!hash)
            return;
        const point = pointById.get(hash);
        if (point) {
            const marker = markerById.get(point.id) || null;
            setActiveMarker(marker, point);
            zoomToMarker(point);
        }
    };
    // Check hash on load
    window.addEventListener("load", handleHash);
    // Handle hash changes (browser back/forward)
    window.addEventListener("hashchange", handleHash);
    // Check immediately if already loaded
    if (document.readyState === "complete") {
        handleHash();
    }
};
void initMap();
