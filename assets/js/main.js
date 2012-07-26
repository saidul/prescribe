(function(window, $, document){
var Prescription = {
    init: function(){
        Prescription.addNewOeFeature();
    },

    addNewOeFeature: function(){
        $('#btn-new-oe').live('click', function(){
               $('#modal-oe').modal('show');
        });
    }
}

$(document).ready(function(){
    Prescription.init();
})
})(window, jQuery, document);