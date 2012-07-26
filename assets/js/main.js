(function(window, $, document){
var Prescription = {
    init: function(){
        Prescription.addNewOeFeature();




        Prescription.addPrintFeature();
    },

    addPrintFeature: function(){
        $('#print').on('click', function(){
            $('body').addClass('printing');

            window.print();

            $('body').removeClass('printing');
        });
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