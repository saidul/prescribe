<?php 
require_once __DIR__.'/vendor/autoload.php';

$app = new Silex\Application();
$app['debug'] = true;
$app['data-source'] = "sqlite:".__DIR__.'/data.db3';    //PDO connection string


$app['insert-map'] = array(
    'chief_complain'     => 'INSERT INTO "main"."chief_complain" ( "id", "name") values (:id, :name);',
    'onsite_examination' => 'INSERT INTO "main"."onsite_examination" ( "id" , "name", "shortName" , "unit" ) values (:id, :name, :shortName, :unit);',
    'tests'              => 'INSERT INTO "main"."tests" ( "id" , "name" ) values (:id, :name);',
    'medicine'           => 'INSERT INTO "main"."medicine" ( "id" , "name" ) values (:id, :name);',
    'duration'           => 'INSERT INTO "main"."duration" ( "id" , "name" ) values (:id, :name);',
    'condition'          => 'INSERT INTO "main"."condition" ( "id" , "name" ) values (:id, :name);',
    'advice'             => 'INSERT INTO "main"."advice" ( "id" , "text" , "useCount" ) values (:id, :text, :useCount);',
    'comments'           => 'INSERT INTO "main"."comments" ( "id" , "text" ) values (:id, :text );',
    'prescription'       => 'INSERT INTO "main"."prescription" ( "id" , "name" , "age" , "sex", "date" , "parent" , "data" ) values (:id, :name, :age, :sex , :date, :parent, :data);',
    'schedule'           => 'INSERT INTO "main"."schedule" ( "id" , "name" ) values (:id, :name);',
);

$app['table-map'] = array(
    'cc'        => 'chief_complain',
    'oe'        => 'onsite_examination',
    'tests'     => 'tests',
    'advice'    => 'advice',
    'comments'  => 'comments',
    'medicine'  => 'medicine',
    'condition' => 'condition',
    'duration'  => 'duration',
    'schedule'  => 'schedule',
);


$app->before(function () use ($app){
    $app['dbh'] = new PDO($app['data-source']);
    $app['dbh']->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
});

$app->after(function () {
    // tear down
});

$app->finish(function () use ($app) {
    // after response has been sent
    $app['dbh'] = null;
    unset($app['dbh']);
});



$app->get('/install/db', function() use ($app){
   $tables = array(
       'chief_complain'     => 'CREATE TABLE "main"."chief_complain" ( "id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT NOT NULL);',
       'onsite_examination' => 'CREATE TABLE "main"."onsite_examination" ( "id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT, "shortName" TEXT NOT NULL, "unit" TEXT);',
       'tests'              => 'CREATE TABLE "main"."tests" ( "id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT NOT NULL );',
       'medicine'           => 'CREATE TABLE "main"."medicine" ( "id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT NOT NULL );',
       'condition'          => 'CREATE TABLE "main"."condition" ( "id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT NOT NULL );',
       'duration'           => 'CREATE TABLE "main"."duration" ( "id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT NOT NULL );',
       'advice'             => 'CREATE TABLE "main"."advice" ( "id" INTEGER PRIMARY KEY NOT NULL, "text" TEXT, "useCount" INTEGER NOT NULL DEFAULT (0) );',
       'comments'           => 'CREATE TABLE "main"."comments" ( "id" INTEGER NOT NULL, "text" TEXT NOT NULL );',
       'prescription'       => 'CREATE TABLE "main"."prescription" ( "id" TEXT PRIMARY KEY NOT NULL, "name" TEXT, "age" INTEGER, "sex" TEXT, "date" INTEGER, "parent" INTEGER, "data" TEXT );',
       'schedule'           => 'CREATE TABLE "main"."schedule" ( "id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT NOT NULL );',
   );

    echo "<pre>";
    // Drop databases
    foreach($tables as $tableName => $sql) {

        $dropSql = 'DROP TABLE IF EXISTS "'.$tableName.'";';
        echo $dropSql."\n";
        $app['dbh']->exec($dropSql);
        echo $sql."\n";
        $app['dbh']->exec($sql);
    }

    echo "</pre>";
});


$app->post('/sync', function() use ($app){

    $request = json_decode($app['request']->request->get('request'),true);


    $newInserts = insertBatchData($request['data'], $app);

    return $app->json(array('newData'=>$newInserts));
});


$app->get('/getData/{type}', function($type) use ($app){

    if(!isset($app['table-map'][$type])) $app->abort(500, "Unknown type");

    $tableName = $app['table-map'][$type];
    $sql = "SELECT * from {$tableName};";
    /** @var $statement PDOStatement */
    $statement = $app['dbh']->query($sql);
    $statement->setFetchMode(PDO::FETCH_ASSOC);
    $data = array();
    while($row = $statement->fetch(PDO::FETCH_ASSOC)) {
        $data[] = $row;
    }

    return $app->json($data);

});

$app->post('/removeData/{type}', function($type) use ($app){

    if(!isset($app['table-map'][$type])) $app->abort(500, "Unknown type");

    $request = json_decode($app['request']->request->get('request'), true);

    $tableName = $app['table-map'][$type];
    $sql = "DELETE from {$tableName} WHERE id=:id;";
    /** @var $statement PDOStatement */
    $statement = $app['dbh']->prepare($sql);
    $count = 0;
    foreach($request['deletedItems'] as $item){
        $statement->execute(array('id'=> $item['id']));
        $count += $statement->rowCount();
    }


    return $app->json(array('deleted' => $count));

});

$app->get('/prescription/find', function() use ($app){

    $term = $app['request']->get('term');

    $sql = "SELECT id, id value, name label, age, sex, date from prescription WHERE id LIKE :idTerm OR name LIKE :term LIMIT 0,10;";


    /** @var $stmt PDOStatement */
    $stmt = $app['dbh']->prepare($sql);
    $stmt->bindValue(':idTerm', "{$term}%");
    $stmt->bindValue(':term', "%{$term}%");
    $stmt->execute();
    $stmt->setFetchMode(PDO::FETCH_ASSOC);
    $data = array();
    while($row = $stmt->fetch()) {
        $data[] = $row;
    }

    return count($data) ? $app->json($data) : "[]";
});

$app->post('/savePrescription', function() use ($app){
    $request = json_decode($app['request']->request->get('request'),true);
    $stmt = $app['dbh']->prepare($app['insert-map']['prescription']);
    if(!isset($request['id']))
          $request['id'] = time();

    $newData = insertBatchData($request['data'], $app);

    $request['data'] = serialize($request['data']);
    $stmt->execute($request);

    return $app->json(array('newData'=>$newData));
});

$app->get('/getPrescription/{id}', function($id) use ($app){
    $prescription = getPrescription($id, $app);
    return $app->json($prescription);
});


$app->run();

function insertBatchData($data, $app){
    $newInserts = array();
    $preparedStatementCache = array();


    foreach($data as $tabKey => $rows) {
        if($tabKey == 'treatments') {
            //treat specially
            foreach($rows as $tRecord){
                foreach($tRecord as $tabKey=>$row)
                    insertRow($tabKey, $row, $preparedStatementCache, $newInserts);
            }
            continue;
        }

        if(!isset($app['table-map'][$tabKey])) continue; //Skip not mapped tables
        foreach($rows as $row)
            insertRow($tabKey, $row, $preparedStatementCache, $newInserts);
    }

    return $newInserts;
}

function insertRow($tabKey, $row, &$preparedStatementCache = array(), &$newInserts = array()) {
    global $app;
    if(!isset($app['table-map'][$tabKey])) return; //Skip not mapped tables
    if(!is_array($row)) return; // return for invalid data

    $tableName = $app['table-map'][$tabKey];

    if( !isset($preparedStatementCache[$tableName])) {
        $preparedStatementCache[$tableName] = $app['dbh']->prepare($app['insert-map'][$tableName]);
    }
    /** @var $stmt PDOStatement */
    $stmt = $preparedStatementCache[$tableName];

    $id = is_exist($tableName, $row, $app);
    if(false === $id){
        //save comment
        if(isset($row['comment'])){
            insertRow('comments', $row['comment'], $preparedStatementCache, $newInserts);
        }

        unset($row['comment']);
        unset($row['dirty']);

        //Onsite Exp
        unset($row['value']);

        if(!isset($row['id'])) $row['id'] = time();
        $stmt->execute($row);
        $newInserts[$tabKey][] = $row;
    } else {
        $row['id'] = $id;
    }
}

function getPrescription($id, $app){
    $sql = "SELECT * FROM prescription WHERE id=:id";
    /** @var $stmt PDOStatement */
    $stmt = $app['dbh']->prepare($sql);
    $stmt->bindValue(':id', $id);
    $stmt->execute();

    if($prescription = $stmt->fetch(PDO::FETCH_ASSOC)){
        $prescription['data'] = unserialize($prescription['data']);
        return $prescription;
    }

    return null;
}



function is_exist($table, $row, $app) {
    $searchField = array(
        'chief_complain'     => 'name',
        'onsite_examination' => 'shortName',
        'tests'              => 'name',
        'advice'             => 'text',
        'medicine'           => 'name',
        'condition'          => 'name',
        'duration'           => 'name',
        'schedule'           => 'name',
        'comments'           => 'text'
    );

    $colName = $searchField[$table];
    $sql = "SELECT id, COUNT($colName) as totalMatch FROM $table WHERE $colName LIKE :$colName";
    /** @var $stmt PDOStatement */
    $stmt = $app['dbh']->prepare($sql);
    $stmt->bindValue(':'.$colName, $row[$colName]);

    $stmt->execute();

    $data = $stmt->fetch();

    return $data['totalMatch'] > 0 ? $data['id'] : false;

}