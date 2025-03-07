import React, {useEffect} from 'react';
import {Button, SafeAreaView, ScrollView, StatusBar, Text} from 'react-native';

import Instabug, {InvocationEvent} from 'instabug-reactnative';

import config from './config';

function App(): React.JSX.Element {
  useEffect(() => {
    if (!config.instabugToken) {
      console.warn('Instabug token is missing');
    }
    Instabug.init({
      token: config.instabugToken,
      invocationEvents: [InvocationEvent.twoFingersSwipe],
    });
    console.log('Initialized Instabug');
  }, []);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}>
      <StatusBar barStyle={'dark-content'} backgroundColor="white" />
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
        style={{
          flex: 1,
          backgroundColor: 'white',
        }}>
        <Text>Instabug + RN 0.77.0</Text>

        <Text>__DEV__: {`${__DEV__}`}</Text>

        {__DEV__ ? (
          <Text style={{color: 'red', textAlign: 'center'}}>
            You are running the debug build. To test the issue you need the
            release build
          </Text>
        ) : null}

        {config.instabugToken ? null : (
          <Text style={{color: 'red', textAlign: 'center'}}>
            Instabug token is missing in config.ts
          </Text>
        )}

        <Button
          title="Show instabug"
          onPress={() => {
            Instabug.show();
          }}
        />

        {/* On an async function, the error is non fatal.
            It is correctly captured and reported with the error message
            on 0.77.0 but NOT on 0.77.1
            On 0.77.1, Instabug crash reporter itself crashes while trying
            to report and it is fatal
            The report you see is the crash report of Instabug itself
            and not from the error
        */}
        <Button
          title="Throw error async"
          onPress={async () => {
            const sleep = (ms: number) =>
              new Promise(resolve => setTimeout(resolve, ms));
            console.log('Doing something async from RN 0.77.0');
            await sleep(100);
            console.log('Something went wrong from RN 0.77.0');
            throw new Error('This is an async test error from RN 0.77.0');
          }}
        />

        {/* In a sync function, the error is fatal
            and it is correctly captured and reported
            with the error message on
            both 0.77.0 and 0.77.1
        */}
        <Button
          title="Throw error sync"
          onPress={() => {
            throw new Error('This is a sync test error from RN 0.77.0');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
