/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.post('/auth/login', 'AuthController.login')

Route.group(() => {
    Route.resource('/organizations', 'OrganizationsController')
    Route.resource('/directories', 'DirectoriesController')
    Route.resource('/directory-indexes', 'DirectoryIndexesController')
    Route.resource('/directory-indexes/:indexId/list-values', 'DirectoryIndexesListValuesController')
    Route.post('/documents/search', 'DocumentsController.search')
    Route.resource('/documents', 'DocumentsController')
    Route.get('/documents/:id/file', 'DocumentsController.download')
    Route.post('/documents/:id/duplicate', 'DocumentsController.duplicate')
    Route.resource('/documents/:documentId/versions', 'DocumentVersionsController')
    Route.put('/documents/:documentId/indexes', 'DocumentIndexesController.update')

    Route.group(() => {
        Route.resource('/users', 'UsersController')
        Route.resource('/storages', 'StoragesController')
        Route.resource('/users/:userId/organizations', 'UserOrganizationsController')
        Route.resource('/users/:userId/directories', 'UserDirectoriesController')
    }).middleware('isAdmin')
}).middleware('auth')