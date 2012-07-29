DAO = {
    endPoints: {
        sync: 'index.php/sync',
        recreate: 'index.php/install/db',
        searchPrescription: 'index.php/prescription/find',
        get_cc: 'index.php/getData/cc',
        get_oe: 'index.php/getData/oe',
        get_tests: 'index.php/getData/tests',
        get_advice: 'index.php/getData/advice',
        get_condition: 'index.php/getData/condition',
        get_duration: 'index.php/getData/duration',
        get_medicine: 'index.php/getData/medicine',
        get_comments: 'index.php/getData/comments',

        getPrescription: 'index.php/getPrescription/{id}',
        savePrescription: 'index.php/savePrescription'


    },

    data: {
        cc: [],
        oe: [],
        tests: [],
        advice: [],
        medicine: [],
        condition: [],
        duration: [],
        comments: []

    },
    generateId: function(){
        return Date.now();
    },

    getCheifComplainByName: function(name, create){
        for(var i=0;i<DAO.data.cc.length;i++) {
            if(DAO.data.cc[i].name == name) return DAO.data.cc[i];
        }

        if(create){
            var rec = {id: DAO.generateId(), name: name, dirty: true };
            //DAO.data.cc.push(rec);
            return rec;
        }
    },

    getCommentByText: function(text){
        for(var i=0;i<DAO.data.comments.length;i++) {
            if(DAO.data.comments[i].text == text) return DAO.data.comments[i];
        }

        var rec = {id: DAO.generateId(), text: text, dirty: true };
        //DAO.data.medicine.push(rec);
        return rec;
    },

    getOnsiteExamenationByShortName: function(shortName) {
        for(var i=0;i<DAO.data.oe.length;i++) {
            if(DAO.data.oe[i].shortName == shortName) return DAO.data.oe[i];
        }
    },

    getMedicineByName: function (name) {
        for(var i=0;i<DAO.data.medicine.length;i++) {
            if(DAO.data.medicine[i].name == name) return DAO.data.medicine[i];
        }

        var rec = {id: DAO.generateId(), name: name, dirty: true };
        //DAO.data.medicine.push(rec);
        return rec;
    },

    getDurationByName: function (name) {
        for(var i=0;i<DAO.data.duration.length;i++) {
            if(DAO.data.duration[i].name == name) return DAO.data.duration[i];
        }

        var rec = {id: DAO.generateId(), name: name, dirty: true };
        //DAO.data.duration.push(rec);
        return rec;
    },

    getConditionByName: function (name) {
        for(var i=0;i<DAO.data.condition.length;i++) {
            if(DAO.data.condition[i].name == name) return DAO.data.condition[i];
        }

        var rec = {id: DAO.generateId(), name: name, dirty: true };
        //DAO.data.condition.push(rec);
        return rec;
    },

    getTestsByName: function (name) {
        for(var i=0;i<DAO.data.condition.length;i++) {
            if(DAO.data.tests[i].name == name) return DAO.data.tests[i];
        }

        var rec = {id: DAO.generateId(), name: name, dirty: true };
        //DAO.data.tests.push(rec);
        return rec;
    },

    getPrescription: function(id, callback){
        $.getJSON(DAO.endPoints.getPrescription.replace('{id}', id), callback);
    },

    savePrescription: function(pData, callback){
        $.post(DAO.endPoints.savePrescription, {request: JSON.stringify(pData)}, function(pData){

            //Adding newly incoming data
            if(pData && pData.newData) {
                var count = 0;
                for (var k in pData.newData) {
                    if(!pData.newData.hasOwnProperty(k)) continue;
                    if(DAO.data[k])
                    for(var i=0; i < pData.newData[k].length; i++){
                        DAO.data[k].push(pData.newData[k][i]);
                    }
                    $(DAO).trigger('dataloaded.'+k);
                }
            }

            callback(arguments);
        })
    },

    loadData: function(type, callback){
        $.ajax({
            url: DAO.endPoints['get_'+type],
            dataType: 'json',
            success: function(data, txtStatus){
                 DAO.data[type] = data instanceof Array ? data : [];
                 $(DAO).trigger('dataloaded.'+type);
                 if(callback) callback();
            }
        });
    },

    resetDatabase: function(callback) {
        $.get(DAO.endPoints.recreate, callback);
    },

    selectiveSyncData: function(type, callback){
        var req = {
            data: { }
        }
        req.data[type] = DAO.data[type];

        $.post(DAO.endPoints.sync, {request: JSON.stringify(req)}, function(){
            callback();
        })
    },

    syncData: function(callback){
           var req = {
               data: DAO.data
           }

        $.post(DAO.endPoints.sync, {request: JSON.stringify(req)}, function(){
            alert("Sync done..");
        })
    },

    loadDummyData: function() {
       DAO.data.cc = [
           {id: 1, name: 'Fever'},
           {id: 2, name: 'Abdominal Pain'},
           {id: 3, name: 'Headache'},
           {id: 4, name: 'Diarrhoea'},
           {id: 5, name: 'Blind while sleeping'},
           {id: 6, name: 'Vomitting'}
       ];
        $(DAO).trigger('dataloaded.cc');

        DAO.data.comments = [
            {id: 1, text: '{num} days' },
            {id: 9, text: '{num} days {num} times' },
            {id: 2, text: 'night' },
            {id: 3, text: 'Day and night' },
            {id: 4, text: '{num} times' }
        ];
        $(DAO).trigger('dataloaded.comments');

       DAO.data.oe = [
           {id: 1, name: 'Pulse', shortName: 'P', unit: '' },
           {id: 2, name: 'Blood Pressure', shortName: 'BP', unit: '' },
           {id: 3, name: 'Pulse', shortName: 'H-L', unit: '' },
           {id: 4, name: 'Pulse', shortName: 'R/R', unit: '' },
           {id: 5, name: 'Pulse', shortName: 'P', unit: '' }
       ];
        $(DAO).trigger('dataloaded.oe');

       DAO.data.medicine = [
           {id: 1, name: 'Tab. Napa 500'},
           {id: 2, name: 'Tab. Napa Extra 500'},
           {id: 3, name: 'Cap. Xeldrin 20'},
           {id: 4, name: 'Tab. Paracitamol 96'},
           {id: 5, name: 'Oin. Dermasol N'},
           {id: 6, name: 'Tab. Guji Muji Mush 500'},
           {id: 7, name: 'Tab. Daomin 300'},
           {id: 8, name: 'Tab. Diamicron MR 50'},
           {id: 9, name: 'Tab. Kow Mow u 00'}
       ];
        $(DAO).trigger('dataloaded.medicine');

       DAO.data.condition = [
           {id: 1, name: 'Khaoar age'},
           {id: 2, name: 'Khaoar pore'},
           {id: 3, name: 'Before dinner'},
           {id: 4, name: 'After dinner'}
       ];
        $(DAO).trigger('dataloaded.condition');

       DAO.data.duration = [
           {id: 1, name: '{num} day'},
           {id: 2, name: '{num} month'},
           {id: 3, name: '{num} week'},
           {id: 4, name: '{num} hour'}
       ];
        $(DAO).trigger('dataloaded.duration');

       DAO.data.tests = [
            { id:10, name: 'USG of L/A' },
            { id:11, name: 'USG of W/A' },
            { id:12, name: 'USG of U/A' },
            { id:13, name: 'USG of Pre. Profile' },
            { id:14, name: 'X-ray Lt Ankle Joint B/V' },
            { id:15, name: 'X-ray Rt Ankle Joint B/V' },
            { id:16, name: 'X-ray Tibia 7 Fibula' },
            { id:18, name: 'X-ray Femur' },
            { id:19, name: 'X-ray Pelvis with Hip Joint A/P View ' },
            { id:20, name: 'X-ray Radius Ulna' },
            { id:21, name: 'X-ray Hand' },
            { id:22, name: 'X-ray Humerus' },
            { id:23, name: 'X-ray Rt. Wrist Joint' },
            { id:24, name: 'X-ray Lt Elbow Joint' },
            { id:25, name: 'X-ray Rt Elbow Joint' },
            { id:26, name: 'X-ray S.I.Joint' },
            { id:27, name: 'X-raySpine B/V' },
            { id:28, name: 'X-ray Nasopharynx' },
            { id:29, name: 'X-ray Lumbo-Spine B/V' },
            { id:30, name: 'X-ray Lumbo- Dorsal Spine B/V' },
            { id:31, name: 'X-ray Cervical Spine B/V' },
            { id:33, name: 'X-ray PNS' },
            { id:34, name: 'X-ray Skull B/V' },
            { id:35, name: 'X-ray Chest P/A View' },
            { id:38, name: 'X-ray Pelvis' },
            { id:39, name: 'X-ray Rt. Shoulder joint B/V' },
            { id:40, name: 'X-ray Lt. Shoulder joint B/V' },
            { id:41, name: 'X-ray Lt Knee Joint B/V' },
            { id:42, name: 'X-ray Rt Knee Joint B/V' },
            { id:43, name: 'X-ray Lumbo sacral spine B/V' },
            { id:44, name: 'X-ray L/S B/V' },
            { id:45, name: 'Plain X-ray Abdomen' },
            { id:46, name: 'CBC' },
            { id:47, name: 'RBS' },
            { id:48, name: 'S. Bilirubin' },
            { id:49, name: 'Widal Test' },
            { id:50, name: 'Blood Grouping' },
            { id:51, name: 'RA Test' },
            { id:52, name: 'LFT' },
            { id:53, name: 'S. Creatinine' },
            { id:54, name: 'S. Urea' },
            { id:55, name: 'Uric acid' },
            { id:56, name: 'HBs Ag(s)' },
            { id:57, name: 'HBs Ag (confirm)' },
            { id:58, name: 'HBs Ag(Elisa)' },
            { id:59, name: 'Urine R/E' },
            { id:60, name: 'Urine R/M/E' },
            { id:61, name: 'TG' },
            { id:62, name: 'Bl. C/S' },
            { id:63, name: 'Urine PT' },
            { id:64, name: 'S. Lipid Profile' },
            { id:65, name: 'FBS' },
            { id:66, name: '2 hr.ABF' },
            { id:67, name: 'BL. Urea' },
            { id:68, name: 'VDRL' },
            { id:69, name: 'X-ray Nose lat View' },
            { id:70, name: 'Xray Nose' },
            { id:71, name: 'TSH' },
            { id:73, name: 'TPHA' },
            { id:74, name: 'Serum Uric Acid' },
            { id:75, name: 'Stool R/M/E' },
            { id:76, name: 'ESR' },
            { id:77, name: 'TC.DC. Hb% ESR' },
            { id:78, name: 'TC,DC ESR' },
            { id:79, name: 'TC,DC,Hb%' },
            { id:80, name: 'Hb% & ESR' },
            { id:81, name: 'TC,DC' },
            { id:82, name: 'Hb%' },
            { id:83, name: 'C. U. Count100' },
            { id:84, name: 'M.P.(Malarial Parasite)' },
            { id:85, name: 'Biood Film' },
            { id:86, name: 'Platelet Count' },
            { id:87, name: 'BT.CT.' },
            { id:88, name: 'Prothrombin Time' },
            { id:89, name: 'APTT' },
            { id:90, name: 'Reticulocyte Count' },
            { id:91, name: 'MCV(Main Corpuscular Volume)' },
            { id:92, name: 'MCH' },
            { id:93, name: 'MCHC' },
            { id:94, name: 'PCV(Pac Cell Volume)' },
            { id:95, name: 'FDP' },
            { id:96, name: 'L. E. Cells' },
            { id:97, name: 'FIbrinogen Level' },
            { id:98, name: 'ASo Titre' },
            { id:99, name: 'Febrile Antigen' },
            { id:100, name: 'R/A RF Test' },
            { id:101, name: 'Rose Waaler Test' },
            { id:102, name: 'LE Cell' },
            { id:103, name: 'C. Reactive Protein' },
            { id:104, name: 'VDRL(Qlty/Qnty)' },
            { id:105, name: 'VDRL(Qlty)' },
            { id:106, name: 'VDRL(Qnty)' },
            { id:107, name: 'IgM' },
            { id:108, name: 'IgG' },
            { id:109, name: 'IgE' },
            { id:110, name: 'IgA' },
            { id:111, name: 'DNA' },
            { id:112, name: 'ANA' },
            { id:113, name: 'ANF' },
            { id:114, name: 'C3' },
            { id:115, name: 'C4' },
            { id:116, name: 'Blood Group & Rh factor' },
            { id:117, name: 'Rh. Antibody Tire' },
            { id:118, name: 'Coomb\'s Test(Direct & Indirect)' },
            { id:119, name: 'Coomb\'s Test(Direct )' },
            { id:120, name: 'Coomb\'s Test(Indirect)' },
            { id:121, name: 'C.F.T for Filaria' },
            { id:122, name: 'C.F.T for Kala Azar' },
            { id:123, name: 'D.A.T for Kala Azar' },
            { id:124, name: 'Myco Dot for TB' },
            { id:125, name: 'Anti-Mycobacterial-lgG,lgA,lgM' },
            { id:126, name: 'Anti-Mycobacterial-lgG' },
            { id:127, name: 'Anti-Mycobacterial-lgA' },
            { id:128, name: 'Anti-Mycobacterial-lgM' },
            { id:129, name: 'I.F.A T for Filaria' },
            { id:130, name: 'I.A. AT kala Azar' },
            { id:131, name: 'Blood Cross Matching' },
            { id:132, name: 'Anty-ds DNA (Anti DNA & ANF) ' },
            { id:133, name: 'Infection Monoleosis (IM)' },
            { id:134, name: 'H. Pylori (Delivery after 3 day' },
            { id:135, name: 'Anti  Chlamydial Anti body IgG' },
            { id:136, name: 'Toxo Plasmal-lgG,lgA,lgM (800x3)' },
            { id:137, name: 'I.C.T for filaria' },
            { id:138, name: 'Dengur (IgG/IgM)' },
            { id:140, name: 'VIP Cabin ' },
            { id:142, name: 'Doctor fee' },
            { id:143, name: 'X-ray  KUB' },
            { id:144, name: 'ECG' },
            { id:145, name: 'Nebulization' },
            { id:146, name: 'Investigation  Charge' },
            { id:147, name: 'CRP' },
            { id:148, name: 'X-ray Rt. Laterla View' },
            { id:149, name: 'X-ray Rt. Sholder B/V ' },
            { id:150, name: 'X-ray Rt. thigh hip joint B/V ' },
            { id:151, name: 'Suction' },
            { id:152, name: 'Oxygen per hour' },
            { id:153, name: 'CXR P/A view' },
            { id:154, name: 'X-ray Lt. Laterla View' },
            { id:155, name: 'S. electrolyte' },
            { id:156, name: 'Anti Hcv Antibody' },
            { id:157, name: 'Anti Hev Antibody' },
            { id:158, name: 'Liped Profile' },
            { id:159, name: 'S. Amylase' },
            { id:160, name: 'T3' },
            { id:161, name: 'T4' },
            { id:162, name: 'TSH' },
            { id:163, name: 'SGPT' },
            { id:164, name: 'X-ray Lt. wrist B/V' },
            { id:165, name: 'Dental X-ray ' },
            { id:166, name: 'USG of KUB' },
            { id:167, name: 'USG of HBS' },
            { id:169, name: 'X-ray Neek spine B/V' },
            { id:170, name: 'HCV' },
            { id:171, name: 'HEV' },
            { id:172, name: 'TCE' },
            { id:173, name: 'HB AI(c)' },
            { id:174, name: 'Urine C/S' },
            { id:175, name: 'PBF' },
            { id:176, name: 'MT test' },
            { id:177, name: 'Sputum AFB' },
            { id:178, name: 'OT Charge' },
            { id:179, name: 'Surgeon fee' },
            { id:180, name: 'S. Alkalin Phosphates' },
            { id:181, name: 'X-ray Ba-Meal' },
            { id:182, name: 'X-ray Swollo' },
            { id:183, name: 'F T4' },
            { id:184, name: 'PSA' },
            { id:185, name: 'SGOT' },
            { id:186, name: 'S. Ige' },
            { id:187, name: 'S.Calcium' },
            { id:188, name: 'S.Iron' },
            { id:189, name: '24 hrs total protein ' },
            { id:190, name: 'HBeAg' },
            { id:191, name: 'CP' },
            { id:192, name: 'Stool for OBT' },
            { id:193, name: 'B hcg' },
            { id:194, name: 'Pap\'s Smear for G.Stain & C/S' },
            { id:195, name: 'Conj. Swab for G.Stain & C/S' },
            { id:196, name: 'LDL' },
            { id:197, name: 'S.Uric Acid' },
            { id:198, name: 'S. Prolactin' },
            { id:199, name: 'Platelet Count' },
            { id:200, name: 'CPK' },
            { id:201, name: 'Hb A1C' },
            { id:202, name: 'X-ray Hip Joint B/V' },
            { id:203, name: 'X-ray Rt. Leg joint' },
            { id:204, name: 'X-ray Lt. Leg joint' },
            { id:205, name: 'X-ray Rt. Hand joint' },
            { id:206, name: 'X-ray Rt Wrist joint' },
            { id:207, name: 'X-ray Lt. Hand joint' },
            { id:208, name: 'X-ray Lt.Wrist joint' },
            { id:209, name: 'Package of' },
            { id:210, name: 'Umlelical C/S' },
            { id:211, name: 'Urine for microalbumin (spot) ' }
        ];
        $(DAO).trigger('dataloaded.tests');

        DAO.data.advice = [
            {id: 1, useCount:4, text: 'বেশী বেশী তরল খাবার খাবেন।' },
            {id: 2, useCount:5, text: 'জ্বর থাকলে কুসুম গরম পানি দিয়ে শরীর মুছে দিবেন।' },
            {id: 3, useCount:2, text: 'মুড়ি থাকলে মুড়ি খাবেন।' },
            {id: 4, useCount:7, text: 'সকাল বেলা জুতা পড়ে ঘুমুবেন।' },
            {id: 5, useCount:1, text: 'পাঁচ ওয়াক্ত নামাজ পড়বেন।' }
        ];
        $(DAO).trigger('dataloaded.advice');
    }
}