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
    'comments'           => 'INSERT INTO "main"."comments" ( "id" , "comment" , "cType" , "fKey" ) values (:id, :comment, :cType, :fKey);',
    'prescription'       => 'INSERT INTO "main"."prescription" ( "id" , "name" , "age" , "date" , "parent" , "data" ) values (:id, :name, :age, :date, :parent, :data);',
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
       'comments'           => 'CREATE TABLE "main"."comments" ( "id" INTEGER NOT NULL, "comment" TEXT NOT NULL, "cType" TEXT NOT NULL, "fKey" INTEGER NOT NULL );',
       'prescription'       => 'CREATE TABLE "main"."prescription" ( "id" INTEGER PRIMARY KEY NOT NULL, "name" TEXT, "age" INTEGER, "date" INTEGER, "parent" INTEGER, "data" TEXT );',
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



     $loadComments = function($cType, $fKey, $comments) use ($app) {
            foreach($comments as $comment) {
                $id = is_exist('comments', $comment, $app);
                if(false === $id) {
                    $stmt = $app['dbh']->prepare($app['insert-map']['comments']);
                    $stmt->execute(array_merge($comment, array('cType' => $cType, 'fKey' => $fKey)));
                }
            }
     };



    //$recordExist

     foreach($request['data'] as $tabKey => $rows) {
        if(!isset($app['table-map'][$tabKey])) continue; //Skip not mapped tables

         $tableName = $app['table-map'][$tabKey];
         $stmt = $app['dbh']->prepare($app['insert-map'][$tableName]);
         foreach($rows as $row)
         {
             //TODO: if exist then skip else insert
             $comments = isset($row['comments']) ? $row['comments'] : array();
             unset($row['comments']);
             $id = is_exist($tableName, $row, $app);
             if(false === $id){
               $stmt->execute($row);
             } else {
                 $row['id'] = $id;
             }


             $loadComments($tableName, $row['id'], $comments);
         }
     }
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
        $comments = getComments($tableName, $row['id'], $app);
        if(count($comments))
            $row['comments'] = $comments;

        $data[] = $row;
    }

    return $app->json($data);

});


$app->run();


function getComments($cType, $fKey, $app){
    $sql = "SELECT id,comment FROM comments WHERE cType = :cType AND fKey = :fKey";
    /** @var $stmt PDOStatement */
    $stmt = $app['dbh']->prepare($sql);
    $stmt->bindValue(':cType', $cType);
    $stmt->bindValue(':fKey', $fKey);

    $stmt->execute();

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
        'comments'           => 'comment'
    );

    if($table == 'comments') {
        $sql = "SELECT id, COUNT(id) as totalMatch FROM $table WHERE comment LIKE :comment AND cType = :cType AND fKey = :fKey";
        /** @var $stmt PDOStatement */
        $stmt = $app['dbh']->prepare($sql);
        $stmt->bindValue(':comment', $row['comment']);
        $stmt->bindValue(':cType', $row['cType']);
        $stmt->bindValue(':fKey', $row['fKey']);
    } else {
        $colName = $searchField[$table];
        $sql = "SELECT id, COUNT($colName) as totalMatch FROM $table WHERE $colName LIKE :$colName";
        /** @var $stmt PDOStatement */
        $stmt = $app['dbh']->prepare($sql);
        $stmt->bindValue(':'.$colName, $row[$colName]);
    }
    $stmt->execute();

    $data = $stmt->fetch();

    return $data['totalMatch'] > 0 ? $data['id'] : false;

}