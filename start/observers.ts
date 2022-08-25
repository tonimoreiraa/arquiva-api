/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import * as Models from 'App/Models'

for (const Model of Object.values(Models)) {
  Model.observe()
}