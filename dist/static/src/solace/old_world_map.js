import { marked } from "marked";
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
    !searchToggle) {
    throw new Error("Solace map page is missing required elements.");
}
const formatPercent = (value) => `${value}%`;
const buildMetaLine = (point) => {
    const parts = [point.subtitle, point.region, point.subRegion].filter(Boolean);
    return parts.join(" · ");
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
const createFallbackPanzoom = (stage, viewport) => {
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    const applyTransform = () => {
        stage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
        viewport.style.setProperty("--map-zoom", scale.toString());
        viewport.style.setProperty("--map-zoom-inv", (1 / scale).toString());
    };
    const clampScale = (nextScale) => Math.min(16, Math.max(1, nextScale));
    const zoomBy = (delta) => {
        scale = clampScale(scale + delta);
        applyTransform();
    };
    viewport.addEventListener("wheel", (event) => {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.1 : -0.1;
        zoomBy(delta);
    }, { passive: false });
    viewport.addEventListener("pointerdown", (event) => {
        const target = event.target;
        if (target?.closest(".solace-map-marker")) {
            return;
        }
        event.preventDefault();
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
        viewport.setPointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointermove", (event) => {
        event.preventDefault();
        if (!isDragging) {
            return;
        }
        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        translateX += deltaX;
        translateY += deltaY;
        applyTransform();
    });
    viewport.addEventListener("pointerup", (event) => {
        isDragging = false;
        viewport.releasePointerCapture(event.pointerId);
    });
    viewport.addEventListener("pointercancel", (event) => {
        isDragging = false;
        viewport.releasePointerCapture(event.pointerId);
    });
    applyTransform();
    return {
        zoomIn: () => zoomBy(0.2),
        zoomOut: () => zoomBy(-0.2),
        reset: () => {
            scale = 1;
            translateX = 0;
            translateY = 0;
            applyTransform();
        },
        zoomWithWheel: (event) => {
            event.preventDefault();
            const delta = event.deltaY < 0 ? 0.1 : -0.1;
            zoomBy(delta);
        },
    };
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
        }
        else {
            activeState.id = null;
            updatePanel(null);
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
                maxZoom: 16,
                minZoom: 1,
                zoomSpeed: 0.065,
                smoothScroll: false,
            })
            : panzoomFactory(mapStage, {
                maxScale: 16,
                minScale: 1,
                contain: "outside",
                smoothScroll: false,
            })
        : null;
    const createPanzoomController = (instance) => {
        if (!instance) {
            return createFallbackPanzoom(mapStage, mapViewport);
        }
        const getTransform = () => instance.getTransform?.() ?? { x: 0, y: 0, scale: 1 };
        const zoomAbs = instance.zoomAbs?.bind(instance);
        const moveTo = instance.moveTo?.bind(instance);
        const syncZoomScale = () => {
            const transform = getTransform();
            mapViewport.style.setProperty("--map-zoom", transform.scale.toString());
            mapViewport.style.setProperty("--map-zoom-inv", (1 / transform.scale).toString());
        };
        const zoomBy = (delta) => {
            const transform = getTransform();
            const rect = mapViewport.getBoundingClientRect();
            const nextScale = Math.min(16, Math.max(1, transform.scale + delta));
            if (zoomAbs) {
                zoomAbs(rect.width / 2, rect.height / 2, nextScale);
                syncZoomScale();
            }
        };
        syncZoomScale();
        return {
            zoomIn: () => {
                if (instance.zoomIn) {
                    instance.zoomIn();
                }
                else {
                    zoomBy(0.2);
                }
                syncZoomScale();
            },
            zoomOut: () => {
                if (instance.zoomOut) {
                    instance.zoomOut();
                }
                else {
                    zoomBy(-0.2);
                }
                syncZoomScale();
            },
            reset: () => {
                instance.reset?.();
                moveTo?.(0, 0);
                zoomAbs?.(0, 0, 1);
                syncZoomScale();
            },
            zoomWithWheel: instance.zoomWithWheel?.bind(instance) ?? ((event) => {
                event.preventDefault();
                zoomBy(event.deltaY < 0 ? 0.1 : -0.1);
            }),
        };
    };
    const panzoom = createPanzoomController(panzoomInstance);
    mapViewport.addEventListener("wheel", panzoom.zoomWithWheel, { passive: false });
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
    const zoomToMarker = (point) => {
        const viewportRect = mapViewport.getBoundingClientRect();
        // Viewport center
        const centerX = viewportRect.width / 2;
        const centerY = viewportRect.height / 2;
        const targetZoom = 5;
        const resetPanzoom = () => {
            if (panzoomInstance?.reset) {
                panzoomInstance.reset();
                return;
            }
            panzoomInstance?.moveTo?.(0, 0);
            panzoomInstance?.zoomAbs?.(0, 0, 1);
        };
        // Use panzoom if available, otherwise fallback
        if (panzoomInstance?.moveTo && panzoomInstance?.zoomAbs) {
            // Reset, then zoom to the viewport center, then pan to the marker at target scale
            resetPanzoom();
            requestAnimationFrame(() => {
                const stageWidth = mapStage.clientWidth || mapImage.clientWidth;
                const stageHeight = mapStage.clientHeight || mapImage.clientHeight;
                const markerX = (point.x / 100) * stageWidth;
                const markerY = (point.y / 100) * stageHeight;
                panzoomInstance.zoomAbs?.(centerX, centerY, targetZoom);
                requestAnimationFrame(() => {
                    const panX = centerX - markerX * targetZoom;
                    const panY = centerY - markerY * targetZoom;
                    panzoomInstance.moveTo?.(panX, panY);
                    mapViewport.style.setProperty("--map-zoom", targetZoom.toString());
                    mapViewport.style.setProperty("--map-zoom-inv", (1 / targetZoom).toString());
                });
            });
        }
        else {
            // Fallback: reset and use zoom buttons
            panzoom.reset();
            panzoom.zoomIn();
            panzoom.zoomIn();
        }
    };
    const toolbarButtons = document.querySelectorAll("[data-map-action]");
    toolbarButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const action = button.getAttribute("data-map-action");
            if (!panzoom) {
                return;
            }
            if (action === "zoom-in") {
                panzoom.zoomIn();
            }
            if (action === "zoom-out") {
                panzoom.zoomOut();
            }
            if (action === "reset") {
                panzoom.reset();
            }
        });
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
        const search = query.trim().toLowerCase();
        if (!search) {
            renderSearchResults([]);
            return;
        }
        const results = points.filter((point) => {
            const haystack = [
                point.name,
                point.subtitle || "",
                point.description || "",
                point.region || "",
                point.subRegion || "",
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(search);
        });
        renderSearchResults(results.slice(0, 8));
    };
    if (searchInput) {
        searchInput.addEventListener("input", () => filterPoints(searchInput.value));
        searchInput.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") {
                return;
            }
            event.preventDefault();
            const match = points.find((point) => point.name.toLowerCase() === searchInput.value.trim().toLowerCase());
            if (match) {
                const marker = markerById.get(match.id) || null;
                openModalForPoint(match, marker);
                renderSearchResults([]);
                setSearchOpen(false);
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
};
void initMap();
