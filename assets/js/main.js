(function(window, $, document){
    var modalCallback;

var Prescription = {
    init: function(){
        Prescription.reset();
        Prescription.initializeModal();

        Prescription.addNewOeControlFeature();
        Prescription.addNewTestControlFeature();
        Prescription.addNewComplainControlFeature();
        Prescription.addNewTreatmentControlFeature();
        Prescription.addResetControlFeature();
        Prescription.addAdviceFeature();
        Prescription.settingsFeature();
        Prescription.enableSaveFeature();
        Prescription.enableLoadFeature();
        Prescription.enableShowDataFeature();




        Prescription.addPrintFeature();

        Prescription.chromePrintWorkground();


        setTimeout(Prescription.loadAllData, 1000);

        $.ajaxSetup({
            error: function(){
                Prescription.utils.updateProgressBar({'msg':'An error occured.'})
                setTimeout(function(){Prescription.utils.hideProgressBar();}, 2000 );
                Prescription.utils.createNotification('<strong>Communication Error: </strong> Error occured while communicating with server.',{type:'error', timeout:10000})
                console.log(arguments);
            }
        })
    },

    getPrescriptionData: function(){
        var pData = {
            name: $('#patient-name').val(),
            age:  $('#patient-age').val(),
            sex:  $('#patient-sex').val(),
            date: $('#prescription-date').val(),
            id : $('#prescription-id').text(),
            data: { }
        }

        var elSelectors = ['#advised-tests', '#chief-complains', '#onsite-experiment', '#treatment', "#advice"];
        $(elSelectors.join(',')).find('li').each(function(){
            var $this =  $(this);
            var data = $this.data('prescriptionData');
            if(data) {
                var type = $this.parent().data('type');
                if(!pData.data[type]) pData.data[type] = [];
                pData.data[type].push(data);
            }
        });

        return pData;
    },

    setPrescriptionData: function(pData){
        $('#patient-name').val(pData.name);
        $('#patient-age').val(pData.age);
        $('#patient-sex').val(pData.sex);
        $('#prescription-date').val(pData.date);
        $('#prescription-id').text(pData.id);


        var applyData = function(d, callable) {
            if(!d) return;

            for(var i=0; i<d.length; i++) {
                callable(d[i]);
            }
        }

        applyData(pData.data.cc, Prescription.addChiefComplain);
        applyData(pData.data.oe, Prescription.addOE);
        applyData(pData.data.tests, Prescription.addTest);
        applyData(pData.data.advice, Prescription.addAdvice);
        applyData(pData.data.treatments, Prescription.addTreatment);
    },

    addChiefComplain: function(data){
        var str  = '<span class="cc-name">'+data.name+'</span>';
        if(data.comment) str += ' - <span class="cc-comment">'+ data.comment.text +'</span>';

        $('<li class="complain-entry"><button data-dismiss="alert" class="close">&times;</button>'+str+'</li>').appendTo('#chief-complains').data('prescriptionData', data);
    },

    addTest: function(data){
        $('<li><button data-dismiss="alert" class="close">&times;</button>'+data.name+'</li>').appendTo('#advised-tests').data('prescriptionData', data);
    },

    addOE: function(data){
        $('<li><button data-dismiss="alert" class="close">&times;</button> '+data.shortName+': '+data.value+ ' ' +data.unit+'</li>').appendTo('#onsite-experiment').data('prescriptionData', data);
    },

    addAdvice: function(data){
        if(!data.useCount) data.useCount = 0;
        $('<li data-item-id="' + data.id + '"> <button data-dismiss="alert" class="close">&times;</button> '+data.text+'</li>').appendTo('#advice').data('prescriptionData', data);
    },

    addTreatment: function (data) {
        var treatMent = '<li><button data-dismiss="alert" class="close">&times;</button>' +
        '<div class="medicine-name">'+(data.medicine ? data.medicine.name : '&nbsp')+'</div>' +
        '<table class="treatment-details">' +
            '<tr class="first-row">' +
                '<td class="schedule" rowspan="2">'+ (data.schedule ? data.schedule : '&nbsp;') +'</td>' +
                '<td class="middle-col">&nbsp;</td>' +
                '<td class="duration" rowspan="2">'+ (data.duration ? data.duration.name : '&nbsp;') +'</td>' +
            '</tr>' +
            '<tr class="second-row"><td class="middle-col condition">'+ (data.condition ? data.condition.name : '&nbsp;') +'</td></tr>' +
        '</table></li>';

        $(treatMent).appendTo('#treatment').data('prescriptionData', data);
    },

    reset: function(){
        $('#advised-tests').empty().parent().addClass('no-print');
        $('#chief-complains').empty().parent().addClass('no-print');
        $('#onsite-experiment').empty().parent().addClass('no-print');
        $('#treatment').empty().parent().addClass('no-print');
        $('#advice').empty().parent().addClass('no-print');

        //button reset
        $('body').removeClass('disable-edit');

        // Hiding progress bar
        $( '#data-load-status').hide();
        $( '.controls.top').hide();
        $('#load').removeClass('active');
        $('#prescription-search').val('')

        var d = new Date();
        $('#prescription-date').val(d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear());
        $('#prescription-id').text(Date.now().toString(26).toUpperCase())
        $('#patient-name').val('');
        $('#patient-age').val('');
        $('#patient-sex').val('');
    },

    print: function(){
        $('body').addClass('printing');

        var elSelectors = ['#advised-tests', '#chief-complains', '#onsite-experiment', '#treatment', '#advice'];
        for(var i=0; i<elSelectors.length; i++) {
            var $el = $(elSelectors[i]);
            if($el.find('li').length)
                $el.parent().removeClass('no-print');
        }

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
            if($('body').hasClass('disable-edit')){
                Prescription.reset();
                return;
            }
            Prescription.showConfirmDialog("Reset?","Do you really want to reset this prescription?", function(){
                Prescription.reset();
            });

        });
    },

    addAdviceFeature: function(){

        var rebuildAdviceDialog = function(){
            var $el = $('#advice-selection-list');
            $el.empty();
            if(DAO.data.advice.length > 0) {
                $(DAO.data.advice).each(function(idx, item){
                    $el.append('<li data-item-id="'+item.id+'"><label><input type="checkbox"><span>'+ item.text +'</span></label></li>');
                });
            }
            $el.append('<li>New: <input type="text" id="newAdviceTxt" class="span6"></li>');
        }

        $(DAO).on('dataloaded.advice', rebuildAdviceDialog);
        $(DAO).on('dataremoved.advice', rebuildAdviceDialog);


        $('#add-advice').on('click', function(){
            $('#advice-selection-dialog :checkbox').removeAttr('checked');
            $('#advice li').each(function(){
                $('#advice-selection-dialog li[data-item-id='+$(this).data('itemId')+'] :checkbox').attr('checked', true);
            });
            $('#advice-selection-dialog').modal('show');
        });

         $('#advice-selection-dialog').delegate('#newAdviceTxt', 'keyup', function(e){
             if(e.keyCode == 13 ){
                 var value = $(this).val().trim();
                 if(value)
                    $(this).parent().before('<li data-item-id="'+ Date.now() +'"><label><input type="checkbox" checked="checked"><span>'+ value +'</span></label></li>');
                 $(this).val('');

             }
         });


        $('#advice-selection-dialog .btn.btn-primary').click(function(){
            $('#advice').empty();
            $('#advice-selection-dialog').find(':checked').parent().each(function(){
                Prescription.addAdvice({
                    id: $(this).parent().data('itemId'),
                    text: $(this).find('span').html()
                });
            });
        });
    },
    addNewOeControlFeature: function(){

        $(DAO).on('dataloaded.oe', function(){
            var $el = $('#btn-add-oe').find('ul.dropdown-menu');
            $el.empty();
            if(DAO.data.oe.length) {
                $(DAO.data.oe).each(function(idx, item){
                    $el.prepend('<li class="existing-oe-item" data-short-name="'+ item.shortName +'" ><a href="#" >'+ item.shortName +': </a></li>');
                });

                $el.append('<li class="divider"></li>');
            }
            $el.append('<li id="btn-new-oe" class="new-oe"><a href="#">Add new...</a></li>')
        });


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

        $('#chief-complains-input').bind('select',function(){
            var   val = $(this).val()
                , hasSubquery = val.indexOf('>') > -1
                , mainQuery = hasSubquery ? val.split('>', 2)[0].trim() : val
                , subQuery = hasSubquery ? val.split('>', 2)[1].trim() : ''
                , rec = DAO.getCheifComplainByName(mainQuery)

            if(!val) return;

            if(subQuery.indexOf('{num}') > -1) {
                $(this).val(mainQuery + ' > ' + subQuery.split('{num}', 2)[0]);
            } else if(!hasSubquery && rec && rec.comments){
                $(this).val(mainQuery + ' > ');
                $(this).typeahead('lookup');
            } else {
                    var ccRec = DAO.getCheifComplainByName(mainQuery, true)
                    if(subQuery) ccRec.comment = DAO.getCommentByText(subQuery);

                    Prescription.addChiefComplain(ccRec);
                    $(this).val('');

            }

        });

        $(DAO).on('dataloaded.cc', function(){
            $el = $('#chief-complains-input');
            $el.typeahead({
                source: DAO.data.cc,
                matcher: Prescription.utils.typeAhedMatcher,
                highlighter: Prescription.utils.typeAhedHighlighter,
                sorter: Prescription.utils.typeAhedSorter

            });
        });
    },

    addNewTestControlFeature: function(){
        $(DAO).on('dataloaded.tests', function(){
            $('#advised-tests-input').typeahead({
                source: DAO.data.tests,
                matcher: Prescription.utils.typeAhedMatcher ,
                highlighter: Prescription.utils.typeAhedHighlighter,
                sorter: Prescription.utils.typeAhedSorter

            });
        });

        $('#advised-tests-input').bind('select',function(){
                if(!$(this).val()) return;
                var rec = DAO.getTestsByName($(this).val())
                Prescription.addTest(rec);
                $(this).val('');
            });
    },

    addNewTreatmentControlFeature: function(){
        $(DAO).on('dataloaded.medicine', function(){
            $('#medicine-input').typeahead({
                source: DAO.data.medicine,
                matcher: Prescription.utils.typeAhedMatcher ,
                highlighter: Prescription.utils.typeAhedHighlighter,
                sorter: Prescription.utils.typeAhedSorter

            });
        });


        $(DAO).on('dataloaded.condition', function(){
            $('#dose-condition').typeahead({
                source: DAO.data.condition,
                matcher: Prescription.utils.typeAhedMatcher ,
                highlighter: Prescription.utils.typeAhedHighlighter,
                sorter: Prescription.utils.typeAhedSorter

            });
        });

        $(DAO).on('dataloaded.duration', function(){
            $('#dose-duration').typeahead({
                source: DAO.data.duration,
                matcher: Prescription.utils.typeAhedMatcher ,
                highlighter: Prescription.utils.typeAhedHighlighter,
                sorter: Prescription.utils.typeAhedSorter

            });
        });



        $(DAO).on('dataloaded.schedule', function(){
            var $el = $('#dose-schedule');
            $el.typeahead({
                source: DAO.data.schedule,
                matcher: Prescription.utils.typeAhedMatcher,
                highlighter: Prescription.utils.typeAhedHighlighter,
                sorter: Prescription.utils.typeAhedSorter

            });
        });

/*

        $('#dose-schedule').typeahead({
            sorter: function(items){
                var numbers = this.query.match(/([\d\u09e6-\u09ef]+)/g)
                  , tmp
                  , items

                if(!numbers) numbers = [];
                while(numbers.length < 3)
                    numbers.push(0);

                tmp = numbers.join(' + ');

                if(tmp.toLowerCase().indexOf(this.query) > -1)
                    items.push();

               return items;
            }
        });

*/

        $('#add-treatment').click(function(){
            var medicine = $('#medicine-input').val().trim() ? DAO.getMedicineByName($('#medicine-input').val()) : null;
            var durationObj = $('#dose-duration').val().trim() ? DAO.getDurationByName($('#dose-duration').val()) : null;
            var condition = $('#dose-condition').val().trim() ? DAO.getConditionByName($('#dose-condition').val()) : null;

            if(!medicine && !durationObj && !condition) return;
            var tData = {
                medicine: medicine,
                duration: durationObj,
                condition: condition,
                schedule: $('#dose-schedule').val()

            }

            for(k in tData)
                if(tData.hasOwnProperty(k) && null == tData[k]) delete tData[k];

            Prescription.addTreatment(tData);

            $('#treatment-input-fields input[type=text]').val('');
        })

    },

    enableShowDataFeature:function(){
        var items = {
            cc : 'CC',
            oe : 'OE',
            tests: 'Tests',
            medicine: 'Medicine',
            comments: 'Misc',
            duration: 'Duration',
            condition: 'Condition',
            advice: 'Advice',
            schedule: 'Schedule'
        }


        var contentFiled = {
            cc : 'name',
            oe : 'shortName',
            tests: 'name',
            medicine: 'name',
            comments: 'text',
            duration: 'name',
            condition: 'name',
            advice: 'text',
            schedule: 'name'
        }


        var $btnContainer = $('#show-data-btn .dropdown-menu');
        for(k in items){
            if(items.hasOwnProperty(k)){
                 $('<li></li>')
                    .data('type', k)
                    .append('<a href="#">'+ items[k] +'</a>')
                     .appendTo($btnContainer)
                 ;
            }
        }

        $(function(){
            $("div.holder").jPages({
                containerID : "data-container",
/*                animation: 'fadeInLeft',*/
                previous : "←",
                next : "→",
                perPage : 10,
                delay : 20
            });
        });

        var $container = $('#data-container');

        $btnContainer.delegate('li', 'click', function(){
            var type = $(this).data('type');

            $container.empty().data('type', type);
            for(var i=0;i<DAO.data[type].length; i++) {
                $('<tr></tr>')
                    .append('<td>'+DAO.data[type][i].id+'</td><td><button data-dismiss="row" class="close">&times;</button>'+DAO.data[type][i][contentFiled[type]]+'</td>')
                    .data('obj', DAO.data[type][i])
                    .data('idx', i)
                    .appendTo($container)
                ;
            }

            $container.data('deletedIndices', []);
            $('#data-delete-commit-btn').hide();

            $("div.holder").data('jPages').reloadSource($container.children());

           $('#data-dialog').modal('show');

        });



        //Click on delete
        $container.delegate('.close', 'click', function(){
            var $row = $(this).parent().parent()
                , type = $container.data('type')
                , idx = $row.data('idx')

            //enque for deletion
            var deleteIndices = $container.data('deletedIndices');
            if(! deleteIndices instanceof Array)
                deleteIndices = [];
            deleteIndices.push(idx);
            $container.data('deletedIndices', deleteIndices);
            var visible = $('#data-delete-commit-btn').is(':visible');
            $('#data-delete-commit-btn').text('Delete '+ deleteIndices.length +' item' + (deleteIndices.length > 1 ? 's':'')).show();
            $('#data-delete-commit-btn').cssAnimate( visible ? 'pulse' : 'flip');
            $row.remove();
        })

        $('#data-delete-commit-btn').click(function(){
            var type = $container.data('type'),
                deleteIndices = $container.data('deletedIndices');

            if(deleteIndices.length == 0) return;

            Prescription.utils.showProgressBar({pct:50, msg: 'Removing ' +deleteIndices.length+ ' Items' })
            DAO.deleteItemsByIndex(type, deleteIndices, function(data){
                Prescription.utils.updateProgressBar({pct:100});
                Prescription.utils.hideProgressBar();

                Prescription.utils.createNotification('<strong>Success!!</strong> Successfully deleted ' + data.deleted + ' Items', {type:'success', timeout:6000});
            })
        })
    },

    enableLoadFeature: function(){
        $('#load').click(function(){$('.controls.top').slideToggle()});

        $( "#prescription-search" ).autocomplete({
            source: DAO.endPoints.searchPrescription,
            minLength: 2,
            select: function( event, ui ) {
                //trigger load
            }
        }).keyup(function(e){
                if(e.keyCode == 13){
                    $('#load-prescription').click();
                }
            })
        .data( "autocomplete" )._renderItem = function( ul, item ) {
            return $( "<li></li>" )
                .addClass('autoCompleteItem')
                .data( "item.autocomplete", item )
                .append( "<a>" + item.label + "<br><span class='summery'>Date:"+item.date+" Age: " + item.age + ", Sex: "+item.sex+"</span></a>" )
                .appendTo( ul );
        };

        $('#load-prescription').click(function(){
            var pid = $('#prescription-search').val();
            if(!pid) return;

            Prescription.utils.showProgressBar({pct: 50, msg: 'Loading...'})
            DAO.getPrescription(pid, function(pData){
                Prescription.utils.updateProgressBar({pct:100});
                Prescription.utils.hideProgressBar();

                if(!pData) {
                    Prescription.utils.createNotification('<strong>Error</strong> Prescription not found.', {type:'error', timeout:4000});
                    return;
                }

                Prescription.reset();
                $('body').addClass('disable-edit');
                Prescription.setPrescriptionData(pData);
                Prescription.utils.createNotification("<strong>Success!</strong> Prescription has been loaded.", {type:'success', timeout: 3000});
            })
        })
    },

    enableSaveFeature: function(){
        $('#save').click(function(){
            if(!Prescription.validate()) return;

            if($('body').hasClass('disable-edit')){
                 Prescription.utils.createNotification('<strong>Save Disabled</strong> You need to reset and create the prescription again.',{type:'warning', timeout: 5000});
                return;
            }

            $('body').addClass('disable-edit');
            var pData = Prescription.getPrescriptionData();
            Prescription.utils.showProgressBar({msg: 'Saving...'})
            DAO.savePrescription(pData, function(){
                Prescription.utils.updateProgressBar({msg: 'Data saved.'});
                Prescription.utils.hideProgressBar();
                Prescription.utils.createNotification("<strong>Success!</strong> Prescription has been saved.", {type:'success', timeout: 3000});
            })
        })
    },

    validate:function(){
        var errors = []
        , pData = Prescription.getPrescriptionData();
        if(!pData.name) errors.push('Patient name field is empty.');
        if(!pData.age) errors.push('Patient age field is empty.');
        if(!pData.sex) errors.push('Patient sex field is empty.');

        //if(!pData.data)

        var count = 0;
        for (var k in pData.data) {
            count = pData.data.hasOwnProperty(k) ? count+1:count;
        }

        if(count == 0) errors.push("Prescription is empty.");

        if(errors.length){
            var content = '<strong>Please solve these errors:</strong><ul><li>' + errors.join("</li><li>") + '</li></ul>';
            Prescription.utils.createNotification(content, {type:'error', timeout: 6000});
            return false;
        }

        return true;
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


    syncAllData: function(callback){

        var item,
            timerId,
            types = ['cc', 'oe', 'tests', 'advice', 'medicine', 'condition', 'duration', 'comments', 'schedule'];
        var total = types.length;
        //$('#data-load-status').slideDown('fast');
        Prescription.utils.showProgressBar({msg: 'Synchronizing data...'});
        var callBack = function(){
            if(item = types.shift()){
                DAO.selectiveSyncData(item, callBack);
            }

            var pct = (100 / total) * (total - types.length);
            Prescription.utils.updateProgressBar({pct: pct, msg: 'Synchronizing '+(item ? item +'...' : 'Completed.')});
            if(pct >= 99 ) {
                clearTimeout(timerId);
                timerId = setTimeout( function(){
                    Prescription.utils.hideProgressBar();
                    if(callback) callback();

                }, 2000);
            }

        }
        callBack();
    },

    loadAllData: function(callback){

        var item,
            timerId,
            types = ['cc', 'oe', 'tests', 'advice', 'medicine', 'condition', 'duration', 'comments', 'schedule'];
        var total = types.length;
        //$('#data-load-status').slideDown('fast');
        Prescription.utils.showProgressBar({msg: 'Loading data...'});
        var callBack = function(){
            if(item = types.shift()){
                DAO.loadData(item, callBack);
            }

            var pct = (100 / total) * (total - types.length);
            Prescription.utils.updateProgressBar({pct: pct, msg: 'Loading '+(item ? item + '...' : 'Completed.')});
            if(pct >= 99 ) {
               clearTimeout(timerId);
               timerId = setTimeout( function(){
                   Prescription.utils.hideProgressBar();
                   if(callback) callback();

               }, 2000);
            }

        }
        callBack();
    },

    settingsFeature: function(){
        $('#settings').click(function(){
            $('#settings-dialog').modal('show');
        });

        $('#create-db').click(function(){
            var $this = $(this);
            $this.button('loading');
            DAO.resetDatabase(function(){$this.button('complete');})
        });

        $('#reload-db').click(function(){
            var $this = $(this);
            $this.button('loading');
            Prescription.loadAllData(function(){$this.button('complete');})
        });

        $('#load-sample-data').click(function(){
            var $this = $(this);
            $this.button('loading');
            DAO.loadDummyData();
            $this.button('complete');
        });

        $('#sync-db').click(function(){
            var $this = $(this);
            $this.button('loading');
            Prescription.syncAllData(function(){$this.button('complete');})
        });

    }
}


    function prepareOption(query, item){
        var numbers = query.match(/([\d\u09e6-\u09ef]+)/g);
        var i = 0;
        var tmp = item.replace(/({num})/g, function(s, key){
            return numbers && i < numbers.length ? numbers[i++] : s;
        });

        return tmp;
    }


    Prescription.utils = {
        typeAhedHighlighter: function (item) {
                var hasSubquery = this.query.indexOf('>') > -1
                , matchFound = false
                , mainQuery = hasSubquery ? this.query.split('>', 2)[0].trim() : this.query
                , subQuery = hasSubquery ? this.query.split('>', 2)[1].trim() : ''
                , query = hasSubquery ? mainQuery + ' > ' + subQuery : this.query
                , query = query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')


            item = item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
                matchFound = true;
                return ('<strong>' + match + '</strong>');
            })


            if(!matchFound && hasSubquery) {
                item = item.split('>', 2);


                mainQuery = mainQuery.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
                item[0] = item[0].trim().replace(new RegExp('(' + mainQuery + ')', 'ig'), function ($1, match) {
                    return '<strong>' + match + '</strong>'
                })

                if(subQuery && item.length > 1) {
                    subQuery.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
                    item[1] = item[1].trim().replace(new RegExp('(' + subQuery + ')', 'ig'), function ($1, match) {
                        return '<strong>' + match + '</strong>'
                    })
                }

                item = item.join(' <strong>&gt;</strong> ');
            }

            return item;
        },

        typeAhedMatcher:function(item){
            var query = this.query,
                hasSubquery = this.query.indexOf('>') > -1
                , tmp = prepareOption(this.query, item.name);

            if(hasSubquery) {
                query = this.query.split('>', 2)[0].trim();
                return item.name == query;
            }

            return ~tmp.toLowerCase().indexOf(query.toLowerCase());
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
                , subItems = []



            if(hasSubquery) {
                //Comment filter
                var subItems = $.grep(DAO.data.comments, function (item) {
                    var tmp = prepareOption(subQuery, item.text);
                    return ~tmp.toLowerCase().indexOf(subQuery.toLowerCase())
                });

                item = {name: mainQuery};
                $(subItems).each(function (idx, comment){
                    var tmp = prepareOption(subQuery, comment.text);

                    if(tmp.toLowerCase().indexOf(subQuery.toLowerCase()) > -1)
                        childMatch.push(item.name + ' > ' + tmp);
                    else if(!subQuery)
                        childMatch.push(item.name + ' > ' + tmp);
                });
            }
            else {
                while (item = items.shift()) {
                    var tmp = prepareOption(this.query, item.name);
                    if (!tmp.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(tmp)
                    else if (!item.name.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item.name)
                    else if (~item.name.indexOf(this.query)) caseSensitive.push(item.name)
                    else caseInsensitive.push(item.name)
                }
            }
            return childMatch.concat(beginswith, caseSensitive, caseInsensitive);
        },
        showProgressBar: function(data){
            if(data) Prescription.utils.updateProgressBar(data);
            $( '#data-load-status' ).effect( 'drop', {direction: 'down', mode: 'show'}, 500);
        },
        hideProgressBar: function(){
            $('#data-load-status').effect( 'drop', {direction: 'down', mode: 'hide'}, 500, function(){
                $('#data-load-status .bar').css('width', '0%');
            });
        },
        updateProgressBar: function(data){
            if(data.pct)
                $('#data-load-status .bar').css('width', data.pct+'%');
            if(data.msg)
                $('#data-load-status .progress-msg').html(data.msg);
        },

        createNotification: function(content, option){
            option = $.extend({
                type: 'warning',
                timeout: 0
            }, option);
            var type = 'alert';
            var str = '<div class="alert alert-'+option.type+' animated"><button class="close" data-dismiss="notification">&times;</button>'+content+'</div>';
            var $el = $(str);
            $el.hide().prependTo('#notification-area').slideDown('fast', function(){$el.cssAnimate('tada')});

            if(option.timeout)  {
                setTimeout(function(){
                    $el.find('[data-dismiss="notification"]').click();
                },option.timeout);
            }

        }
    }

    //Notification hiding
    $('[data-dismiss="notification"]').live('click', function(){var $el = $(this).parent(); $el.slideUp('fast', function(){$el.remove()})});

window.Prescription = Prescription;

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
})( jQuery );

(function( $ ){
    $.fn.cssAnimate=function(animation, timeout) {
        if(!timeout) timeout = 1500
        return this.each(function(idx, el){
            var $el = $(el);
            $el.addClass(animation);
            setTimeout(function(){
                $el.removeClass(animation, 1500);
            });
        });
    };
})( jQuery )
