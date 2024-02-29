import Route from '@ioc:Adonis/Core/Route'

Route.post('/auth/sign-in', 'AuthController.signIn')
Route.post('/auth/sign-up', 'AuthController.signUp')

Route.group(() => {
    Route.get('/auth/user', 'AuthController.getUserData')
    Route.resource('/organizations', 'OrganizationsController')
    Route.resource('/directories', 'DirectoriesController')
    Route.get('/plans/usage', 'PlansController.getStorage')
    Route.resource('/directory-indexes', 'DirectoryIndexesController')
    Route.resource('/directory-indexes/:indexId/list-values', 'DirectoryIndexesListValuesController')
    Route.post('/documents/search', 'DocumentsController.search')
    Route.resource('/documents', 'DocumentsController')
    Route.get('/documents/:id/file', 'DocumentsController.download')
    Route.post('/documents/:id/duplicate', 'DocumentsController.duplicate')
    Route.resource('/documents/:documentId/versions', 'DocumentVersionsController')
    Route.put('/documents/:documentId/indexes', 'DocumentIndexesController.update')
    Route.post('/documents/export-list', 'DocumentsController.exportList')

    Route.resource('/users', 'UsersController')
    Route.resource('/storages', 'StoragesController')
    Route.resource('/users/:userId/organizations', 'UserOrganizationsController')
    Route.resource('/users/:userId/directories', 'UserDirectoriesController')
    Route.get('/organizations/:id/report', 'DocumentReportsController.index')
    Route.get('/path', 'PathsController.index')
}).middleware('auth')