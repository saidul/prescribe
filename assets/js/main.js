(function(window, $, document){
    var modalCallback;

var Prescription = {
    init: function(){
        Prescription.initializeModal();

        Prescription.initializeControls();
        Prescription.chromePrintWorkground();
    },
    addChiefComplain: function(data){
        var str  = '<span class="cc-name">'+data.name+'</span>';
        if(data.comment) str += ' <span class="cc-comment">'+ data.comment +'</span>';

        $('<li class="complain-entry">'+str+'</li>').appendTo('#chief-complains');
    },

    addTest: function(data){
        $('<li>'+data+'</li>').appendTo('#advised-tests');
    },

    addOE: function(data){
        $('<li>'+data.shortName+': '+data.value+ ' ' +data.unit+'</li>').appendTo('#onsite-experiment');
    },

    reset: function(){
        $('#advised-tests').empty();
        $('#chief-complains').empty();
        $('#onsite-experiment').empty();
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
            var oe = DAO.getOnsiteExamenationByShortName($(this).data('shortName'));
            $('#oe-short-name').val(oe.shortName);
            $('#oe-name').val(oe.name);
            //$('#oe-value').val(oe.value);
            $('#oe-unit').val(oe.unit);
        });

        $('#oe-form').submit(function(){
            var data = $('#oe-form').serializeJSON();
            Prescription.addOE(data);
            $('#modal-oe').modal('hide');
           return false;
        });
    },

    addNewComplainControlFeature: function(){
        $('#chief-complains-input').typeahead({
            source: DAO.data.cc,
            /*            updater: function(item) {
             return item.name;
             },*/
            matcher: Prescription.utils.typeAhedMatcher,
            highlighter: Prescription.utils.typeAhedHighlighter,
            sorter: Prescription.utils.typeAhedSorter

        }).change(function(){
                var   val = $(this).val()
                    , hasSubquery = val.indexOf('>') > -1
                    , mainQuery = hasSubquery ? val.split('>', 2)[0].trim() : val
                    , subQuery = hasSubquery ? val.split('>', 2)[1].trim() : ''
                    , rec = DAO.getCheifComplainByName(mainQuery)

                if(subQuery.indexOf('{num}') > -1) {
                    $(this).val(mainQuery + ' > ' + subQuery.split('{num}', 2)[0]);
                } else if(!hasSubquery && rec && rec.comments){
                    $(this).val(mainQuery + ' > ');
                } else {
                    Prescription.addChiefComplain({name: mainQuery, comment: subQuery});

                    $(this).val('');
                }

            });
    },

    addNewTestControlFeature: function(){
        $('#advised-tests-input').typeahead({
           source: DAO.data.tests,
           matcher: Prescription.utils.typeAhedMatcher ,
           sorter: Prescription.utils.typeAhedSorter

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
        Prescription.addNewComplainControlFeature();
        Prescription.addResetControlFeature();




        Prescription.addPrintFeature();

        var $el = $('#btn-add-oe').find('ul.dropdown-menu');
        $(DAO.data.oe).each(function(idx, item){
             $el.prepend('<li class="existing-oe-item" data-short-name="'+ item.shortName +'" ><a href="#" >'+ item.shortName +': </a></li>');
        });
    }
}


    Prescription.utils = {
        typeAhedHighlighter: function (item) {
            var hasSubquery = this.query.indexOf('>') > -1
                , mainQuery = hasSubquery ? this.query.split('>', 2)[0].trim() : this.query
                , subQuery = hasSubquery ? this.query.split('>', 2)[1].trim() : ''
                , query = hasSubquery ? mainQuery + ' > ' + subQuery : this.query
                , query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
                , matchFound = false

            item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                return '<strong>' + match + '</strong>'
                matchFound = true
            })

            if(!matchFound) {
                item = item.replace(new RegExp('(' + mainQuery.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&') + ')', 'ig'), function ($1, match) {
                    return '<strong>' + match + '</strong>'
                })

                if(subQuery) {
                    item = item.replace(new RegExp('(' + subQuery.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&') + ')', 'ig'), function ($1, match) {
                        return '<strong>' + match + '</strong>'
                    })
                }
            }

            return item;
        },

        typeAhedMatcher:function(item){
            var query = this.query,
                hasSubquery = this.query.indexOf('>') > -1;

            if(hasSubquery) {
                query = this.query.split('>', 2)[0].trim();
                return item.name == query;
            }

            return ~item.name.toLowerCase().indexOf(query.toLowerCase());
        },

        typeAhedSorter: function (items) {
            var childMatch = []
                , beginswith = []
                , caseSensitive = []
                , caseInsensitive = []
                , item
                , hasSubquery = this.query.indexOf('>') > -1
                , mainQuery = hasSubquery ? this.query.split('>', 2)[0].trim() : this.query
                , subQuery = hasSubquery ? this.query.split('>', 2)[1].trim() : ''


            while (item = items.shift()) {
                if(mainQuery.toLowerCase() == item.name.toLowerCase() && item.comments) {
                    $(item.comments).each(function (idx, comment){
                        var numbers = subQuery.match(/(\d+)/g);
                        var i = 0;
                        var tmp = comment.comment.replace(/({num})/g, function(s, key){
                            return numbers && i < numbers.length ? numbers[i++] : s;
                        });

                        if(tmp.toLowerCase().indexOf(subQuery.toLowerCase()) > -1)
                            childMatch.push(item.name + ' > ' + tmp);
                        else if(!subQuery)
                            childMatch.push(item.name + ' > ' + tmp);
                    });
                }
                if (!item.name.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item.name)
                else if (~item.name.indexOf(this.query)) caseSensitive.push(item.name)
                else caseInsensitive.push(item.name)
            }

            return childMatch.concat(beginswith, caseSensitive, caseInsensitive);
        }
    }


$(document).ready(function(){
    Prescription.init();
})
})(window, jQuery, document);


(function( $ ){
    $.fn.serializeJSON=function() {
        var json = {};
        jQuery.map($(this).serializeArray(), function(n, i){
            json[n['name']] = n['value'];
        });
        return json;
    };
})( jQuery )
