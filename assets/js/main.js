(function(window, $, document){
    var modalCallback;

var Prescription = {
    init: function(){
        Prescription.initializeModal();

        Prescription.initializeControls();
        Prescription.chromePrintWorkground();
    },
    addTest: function(data){
        $('<li>'+data+'</li>').appendTo('#advised-tests');
    },
    addOE: function(data){
        $('<li>'+data.shortName+': '+data.value+ ' ' +data.unit+'</li>').appendTo('#onsite-experiment');
    },

    reset: function(){
        $('#advised-tests').empty();
    },

    print: function(){
        $('body').addClass('printing');
        window.print();
        $('body').removeClass('printing');
    },

    addPrintFeature: function(){
        $('#print').on('click', function(){
            Prescription.print();
        });
    },

    addResetControlFeature: function(){
        $('#reset').on('click', function(){
            Prescription.showConfirmDialog("Reset?","Do you really want to reset this prescription?", function(){
                Prescription.reset();
            });

        });
    },
    addNewOeControlFeature: function(){
        $('#btn-new-oe').live('click', function(){
               $('#modal-oe').removeClass('existing').modal('show').find('#oe-form').each(function(){this.reset()});
        });

        $('#btn-add-oe').delegate('li.existing-oe-item', 'click', function(){
                $('#modal-oe').addClass('existing').modal('show').find('#oe-form').each(function(){this.reset()});
        });
    },

    addNewTestControlFeature: function(){
        $('#advised-tests-input').typeahead({
           source: DAO.data.tests,
/*            updater: function(item) {
                return item.name;
            },*/
           matcher: function(item){
               return ~item.name.toLowerCase().indexOf(this.query.toLowerCase());
           },
/*           highlighter: function (item) {
                var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
                return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                    return '<strong>' + match + '</strong>'
                });
               },*/
           sorter: function (items) {
                var beginswith = []
                    , caseSensitive = []
                    , caseInsensitive = []
                    , item

                while (item = items.shift()) {
                    if (!item.name.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item.name)
                    else if (~item.name.indexOf(this.query)) caseSensitive.push(item.name)
                    else caseInsensitive.push(item.name)
                }

                return beginswith.concat(caseSensitive, caseInsensitive)
           }

        }).change(function(){
                Prescription.addTest($(this).val());
                $(this).val('');
            });
    },

    initializeModal: function(){
        $('#confirm-dialog').delegate('.btn.ok', 'click', function(){
           if(modalCallback) {modalCallback(); return false;}
        });
    },
    showConfirmDialog: function (title, text, callback) {
        modalCallback = callback;
        $('#confirm-dialog').find('.modal-header h3').text(title);
        $('#confirm-dialog').find('.modal-body p').html(text);
        $('#confirm-dialog').modal('show')
    },

    chromePrintWorkground: function(){
        // detect if browser is Chrome
        if(navigator.userAgent.toLowerCase().indexOf("chrome") >  -1) {
            // wrap private vars in a closure
            var $waitDialog = $('#wait-dialog').modal({keyboard: false, show: false});
            var realPrintFunc = Prescription.print; //window.print;
            var interval = 20000; // 20 secs
            var nextAvailableTime = +new Date(); // when we can safely print again
            var timerId;

            // overwrite window.print function
            //window.print =
            Prescription.print = function() {
                var now = +new Date();
                // if the next available time is in the past, print now
                if(now > nextAvailableTime) {
                    realPrintFunc();
                    nextAvailableTime = now + interval;
                } else {

                    // print when next available
                    clearTimeout(timerId);
                    timerId = setTimeout(function(){
                        $waitDialog.modal('hide');
                        setTimeout(realPrintFunc, 2000);
                        nextAvailableTime += interval;
                    }, nextAvailableTime - now);
                    $waitDialog.modal('show');

                }
            }
        }
    },
    initializeControls: function(){
        DAO.loadDummyData();

        Prescription.addNewOeControlFeature();
        Prescription.addNewTestControlFeature();
        Prescription.addResetControlFeature();




        Prescription.addPrintFeature();

        var $el = $('#btn-add-oe').find('ul.dropdown-menu');
        $(DAO.data.oe).each(function(idx, item){
             $el.prepend('<li class="existing-oe-item" data-id="'+ item.id +'" ><a href="#" >'+ item.shortName +': </a></li>');
        });
    }
}

$(document).ready(function(){
    Prescription.init();
})
})(window, jQuery, document);
