<?php 
require_once __DIR__.'/vendor/autoload.php';

$app = new Silex\Application();
$app['debug'] = true;
$app['data-source'] = "sqlite:".__DIR__.'/data.db3';    //PDO connection string



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

    $tableMap = array(
        'cc'       => 'chief_complain',
        'oe'       => 'onsite_examination',
        'tests'    => 'tests',
        'advice'   => 'advice',
        'comments' => 'comments',
    );


    $tables = array(
        'chief_complain'     => 'INSERT INTO "main"."chief_complain" ( "id", "name") values (?, ?);',
        'onsite_examination' => 'INSERT INTO "main"."onsite_examination" ( "id" , "name", "shortName" , "unit" ) values (?, ?, ?, ?);',
        'tests'              => 'INSERT INTO "main"."tests" ( "id" , "name" ) values (?, ?);',
        'advice'             => 'INSERT INTO "main"."advice" ( "id" , "text" , "useCount" ) values (?, ?, ?);',
        'comments'           => 'INSERT INTO "main"."comments" ( "id" , "comment" , "cType" , "fKey" ) values (?, ?, ?, ?);',
        'prescription'       => 'INSERT INTO "main"."prescription" ( "id" , "name" , "age" , "date" , "parent" , "data" ) values (?, ?, ?, ?, ?, ?);',
    );

     foreach($request['data'] as $tabKey => $rows) {
        if(!isset($tableMap[$tabKey])) continue;
         $tableName = $tableMap[$tabKey];
         $stmt = $app['dbh']->query($tables[$tableName]);
         foreach($rows as $row)
         {
             //TODO: if exist then skip else insert
             $stmt->execute($row);
         }
     }













    echo "<pre>";
    // Drop databases
    foreach($tables as $tableName => $sql) {

    }

    echo "</pre>";
});


$app->get('/getData/all', function() use ($app){
    $tableName = 'chief_complain';
    $sql = "SELECT * from {$tableName};";
    /** @var $statement PDOStatement */
    $statement = $app['dbh']->query($sql);
    $statement->setFetchMode(PDO::FETCH_ASSOC);

    return $app->json($statement->fetchAll());

});




$app->get('/hello/{name}', function ($name) use ($app) {
    return 'Hello '.$app->escape($name);
});
$app->run();

