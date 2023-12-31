import React, { useContext } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import { Context } from '../src/Context/AuthContext'

import Home from './pages/Home'
import CreateRifa from './pages/CreateRifa'
import Register from './pages/Register'
import Account from './pages/Account'
import Image from './pages/Image'
import Fundo from './Fundo'
import TimeLine from './components/TimeLine'

function CustomRoute({ isPrivate, ...rest }) {
  const { loading, authenticated} = useContext(Context)

  if (loading) {
    return <h1>Loading...</h1>
  }

  if (isPrivate && !authenticated) {
    return <Redirect to="/" />
  }

  return <Route {...rest} />
}

export default function Routes() {
  return (
    <Switch>
       <CustomRoute exact path="/"  component={Home} />
       <CustomRoute exact path="/fundo"  component={Fundo} />
      <CustomRoute exact path="/register" component={Register} />
      <CustomRoute exact path="/allrifas" component={TimeLine} />
      <CustomRoute isPrivate exact path="/create" component={CreateRifa} />
    
      <CustomRoute isPrivate exact path="/account" component={Account} />
      <CustomRoute isPrivate exact path="/addimage" component={Image} />
    </Switch>
  );
}