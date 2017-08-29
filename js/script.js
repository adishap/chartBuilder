var dimensions = [];
var measurements = [];

// module to manage draggable
var Dragble = (function() {
    var init = function(dragDiv, dropDiv) {
        dropDiv.droppable({
            accept: dragDiv,
            drop: function(event, ui) {
                var draggableValue = ui.draggable.attr("data-value");
                var droppableId = $(this).attr("id");
                if (droppableId === "selected-dim") {
                    dimensions.push(draggableValue);
                }
                if (droppableId === "select-dim") {
                    dimensions = dimensions.filter(function(a) { return a !== draggableValue });
                }
                if (droppableId === "selected-mes") {
                    measurements.push(draggableValue);
                }
                if (droppableId === "select-mes") {
                    measurements = measurements.filter(function(a) { return a !== draggableValue });
                }
            }
        });
        $(dragDiv).draggable({
            revert: 'invalid'
        });
    };

    var drag = function(dragDiv, dropDiv) {
        init(dragDiv, dropDiv);
    };

    return {
        drag: drag
    };

})();

var init = function() {
    // initialize dragging for dimensions
    Dragble.drag('.dim-draggable', $('.dim-droppable'));
    // initialize dragging for measurements
    Dragble.drag('.mes-draggable', $('.mes-droppable'));
}

init();
