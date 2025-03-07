## Instabug React Native SDK issue with RN 0.77.1 on iOS

The latest Instabug react native sdk (14.1.0) fails at crash reporting certain kinds of errors when used with RN 0.77.1 on iOS, but not when used with RN 0.77.0.

Particularly errors thrown inside async functions. For example:

```tsx
<Button
	title="Throw error async"
	onPress={async () => {
		const sleep = (ms: number) =>
			new Promise((resolve) => setTimeout(resolve, ms));
		console.log("Doing something async");
		await sleep(100);
		console.log("Something went wrong");
		throw new Error("This is an async test error");
	}}
/>
```

Those errors are generally non-fatal. But it seems Instabug Crash reporter itself is crashing while trying to report it, and it's crashing fatally. So an error that would otherwise be non-fatal becomes fatal and the app is closed.

There are two projects in this repo

### RN0770Poject - RN 0.77.0 + Instabug 14.1.0

Here throwing the "async error" works as expected. A non-fatal crash is reported on instabug with the error message. And the app don't close since it is non-fatal.

### RN0771Project - RN 0.77.1 + Instabug 14.1.0

Here throwing the "async error" has the issue. A fatal crash is caused, closing the app and the reported crash on instabug points to Instabug SDK itself. From the crash report, this is the thread that fails:

From the crash report, this is the cause and thread that fails:

```
data:text/text;charset=utf-8,
# Cause: -[NSNull length]: unrecognized selector sent to instance 0x1e3b3ba80
# Reported at: 2025-03-04 15:24:34 UTC

Thread 7 Queue 16: com.apple.root.user-initiated-qos (concurrent) [Crashed]:

0    CoreFoundation                           0x1804b9100     ___exceptionPreprocess
1    libobjc.A.dylib                          0x180092da8     _objc_exception_throw
2    CoreFoundation                           0x1804cebf4     +[NSObject(NSObject) instanceMethodSignatureForSelector:]
3    CoreFoundation                           0x1804bd40c     ____forwarding___
4    CoreFoundation                           0x1804bfb2c     __CF_forwarding_prep_0
5    Foundation                               0x1809d79d4     _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
6    Instabug                                 0x104f47e40     _prepareReportWriter
7    Instabug                                 0x104f278c4     _prepareReportWriter
8    IssueInstabugCrashRepro                  0x102e350f0     ___119-[InstabugCrashReportingBridge sendHandledJSCrash:userAttributes:fingerprint:nonFatalExceptionLevel:resolver:rejecter:]_block_invoke
9    libdispatch.dylib                        0x18017b314     __dispatch_call_block_and_release
10   libdispatch.dylib                        0x18017cc08     __dispatch_client_callout
11   libdispatch.dylib                        0x18018f8d0     __dispatch_root_queue_drain
12   libdispatch.dylib                        0x180190054     __dispatch_worker_thread2
13   libsystem_pthread.dylib                  0x103783b38     __pthread_wqthread
14   libsystem_pthread.dylib                  0x103782934     _start_wqthread
```

And this is the full crash report:

```
data:text/text;charset=utf-8,
# Cause: -[NSNull length]: unrecognized selector sent to instance 0x1e3b3ba80
# Reported at: 2025-03-04 15:24:34 UTC

Thread 0 Queue 1: com.apple.main-thread (serial):

0    libsystem_kernel.dylib                   0x1037fd390     _mach_msg2_trap
1    libsystem_kernel.dylib                   0x1038054f4     _mach_msg_overwrite
2    libsystem_kernel.dylib                   0x1037fd6cc     _mach_msg
3    CoreFoundation                           0x18041cae0     ___CFRunLoopServiceMachPort
4    CoreFoundation                           0x180417008     ___CFRunLoopRun
5    CoreFoundation                           0x180416704     _CFRunLoopRunSpecific
6    GraphicsServices                         0x190604b10     _GSEventRunModal
7    UIKitCore                                0x185b39180     -[UIApplication _run]
8    UIKitCore                                0x185b3d378     _UIApplicationMain
9    UIKitCore                                0x184f0fad4     _block_destroy_helper.22
10   IssueInstabugCrashRepro                  0x102e1bb24     _main

Thread 1 Unknown:

0    libsystem_kernel.dylib                   0x1037fee6c     ___workq_kernreturn
1    libsystem_pthread.dylib                  0x103782934     _start_wqthread

Thread 2 com.apple.uikit.eventfetch-thread:

0    libsystem_kernel.dylib                   0x1037fd390     _mach_msg2_trap
1    libsystem_kernel.dylib                   0x1038054f4     _mach_msg_overwrite
2    libsystem_kernel.dylib                   0x1037fd6cc     _mach_msg
3    CoreFoundation                           0x18041cae0     ___CFRunLoopServiceMachPort
4    CoreFoundation                           0x180417008     ___CFRunLoopRun
5    CoreFoundation                           0x180416704     _CFRunLoopRunSpecific
6    Foundation                               0x180f1f490     -[NSRunLoop(NSRunLoop) runMode:beforeDate:]
7    Foundation                               0x180f1f6b0     -[NSRunLoop(NSRunLoop) runUntilDate:]
8    UIKitCore                                0x185be6a34     -[UIEventFetcher threadMain]
9    Foundation                               0x180f462d8     ___NSThread__start__
10   libsystem_pthread.dylib                  0x1037876f8     __pthread_start
11   libsystem_pthread.dylib                  0x103782940     _thread_start

Thread 3 Unknown:

0    libsystem_kernel.dylib                   0x1037fee6c     ___workq_kernreturn
1    libsystem_pthread.dylib                  0x103782934     _start_wqthread

Thread 4 com.facebook.react.runtime.JavaScript:

0    libsystem_kernel.dylib                   0x1037fd390     _mach_msg2_trap
1    libsystem_kernel.dylib                   0x1038054f4     _mach_msg_overwrite
2    libsystem_kernel.dylib                   0x1037fd6cc     _mach_msg
3    CoreFoundation                           0x18041cae0     ___CFRunLoopServiceMachPort
4    CoreFoundation                           0x180417008     ___CFRunLoopRun
5    CoreFoundation                           0x180416704     _CFRunLoopRunSpecific
6    IssueInstabugCrashRepro                  0x10301683c     +[RCTJSThreadManager runRunLoop]
7    Foundation                               0x180f462d8     ___NSThread__start__
8    libsystem_pthread.dylib                  0x1037876f8     __pthread_start
9    libsystem_pthread.dylib                  0x103782940     _thread_start

Thread 5 hades:

0    libsystem_kernel.dylib                   0x10380082c     ___psynch_cvwait
1    libc++.1.dylib                           0x18030529c     __ZNSt3__118condition_variable4waitERNS_11unique_lockINS_5mutexEEE
2    hermes                                   0x1045affc8     __ZN6hermes2vm7HadesGC8Executor6workerEv
3    hermes                                   0x1045aff30     __ZNSt3__114__thread_proxyB7v160006INS_5tupleIJNS_10unique_ptrINS_15__thread_structENS_14default_deleteIS3_EEEEZN6hermes2vm7HadesGC8ExecutorC1EvEUlvE_EEEEEPvSD_
4    libsystem_pthread.dylib                  0x1037876f8     __pthread_start
5    libsystem_pthread.dylib                  0x103782940     _thread_start

Thread 6 Unknown:

0    libsystem_kernel.dylib                   0x1037fd390     _mach_msg2_trap
1    libsystem_kernel.dylib                   0x1038054f4     _mach_msg_overwrite
2    libsystem_kernel.dylib                   0x1037fd6cc     _mach_msg
3    Instabug                                 0x104f65190     _IBGplcrash_async_macho_string_free
4    libsystem_pthread.dylib                  0x1037876f8     __pthread_start
5    libsystem_pthread.dylib                  0x103782940     _thread_start

Thread 7 Queue 16: com.apple.root.user-initiated-qos (concurrent) [Crashed]:

0    CoreFoundation                           0x1804b9100     ___exceptionPreprocess
1    libobjc.A.dylib                          0x180092da8     _objc_exception_throw
2    CoreFoundation                           0x1804cebf4     +[NSObject(NSObject) instanceMethodSignatureForSelector:]
3    CoreFoundation                           0x1804bd40c     ____forwarding___
4    CoreFoundation                           0x1804bfb2c     __CF_forwarding_prep_0
5    Foundation                               0x1809d79d4     _$sSS10FoundationE36_unconditionallyBridgeFromObjectiveCySSSo8NSStringCSgFZ
6    Instabug                                 0x104f47e40     _prepareReportWriter
7    Instabug                                 0x104f278c4     _prepareReportWriter
8    IssueInstabugCrashRepro                  0x102e350f0     ___119-[InstabugCrashReportingBridge sendHandledJSCrash:userAttributes:fingerprint:nonFatalExceptionLevel:resolver:rejecter:]_block_invoke
9    libdispatch.dylib                        0x18017b314     __dispatch_call_block_and_release
10   libdispatch.dylib                        0x18017cc08     __dispatch_client_callout
11   libdispatch.dylib                        0x18018f8d0     __dispatch_root_queue_drain
12   libdispatch.dylib                        0x180190054     __dispatch_worker_thread2
13   libsystem_pthread.dylib                  0x103783b38     __pthread_wqthread
14   libsystem_pthread.dylib                  0x103782934     _start_wqthread

Thread 8 Unknown:

0    libsystem_kernel.dylib                   0x1037fee6c     ___workq_kernreturn
1    libsystem_pthread.dylib                  0x103782934     _start_wqthread

Thread 9 Unknown:

0    IBGInvalidFramework                      0x104ee4938     0x104edc000

Thread 10 Unknown:

0    IBGInvalidFramework                      0x104ee4938     0x104edc000

Thread 11 Unknown:

0    IBGInvalidFramework                      0x104ee4938     0x104edc000

Thread 12 com.apple.NSURLConnectionLoader:

0    libsystem_kernel.dylib                   0x1037fd390     _mach_msg2_trap
1    libsystem_kernel.dylib                   0x1038054f4     _mach_msg_overwrite
2    libsystem_kernel.dylib                   0x1037fd6cc     _mach_msg
3    CoreFoundation                           0x18041cae0     ___CFRunLoopServiceMachPort
4    CoreFoundation                           0x180417008     ___CFRunLoopRun
5    CoreFoundation                           0x180416704     _CFRunLoopRunSpecific
6    CFNetwork                                0x184a09ce4     +[__CFN_CoreSchedulingSetRunnable _run:]
7    Foundation                               0x180f462d8     ___NSThread__start__
8    libsystem_pthread.dylib                  0x1037876f8     __pthread_start
9    libsystem_pthread.dylib                  0x103782940     _thread_start

Binary Images:

0x1037fc000     libsystem_kernel.dylib                       arm64e     5EA2A242-9786-3AF8-B8A9-7899ECC711C8
0x18038d000     CoreFoundation                               arm64e     6FC1E779-5846-3275-BF66-955738404CF6
0x190601000     GraphicsServices                             arm64e     3126E74D-FD21-3B05-9124-3B2FCF5DB07A
0x184cd9000     UIKitCore                                    arm64e     E83E0347-27D7-34BD-B0D3-51666DFDFD76
0x102e18000     IssueInstabugCrashRepro                      arm64e     F6EDD747-46DC-3825-B91F-FF63F336CF6C
0x103780000     libsystem_pthread.dylib                      arm64e     53372391-80EE-3A52-85D2-B0D39816A60B
0x1807da000     Foundation                                   arm64e     CF6B28C4-9795-362A-B563-7B1B8C116282
0x1802e5000     libc++.1.dylib                               arm64e     FB59D1E0-4DF5-3571-91CF-F5A90235BA68
0x1044e8000     hermes                                       arm64e     C6BA845F-7540-3624-9F81-4645F33FFF49
0x104b58000     Instabug                                     arm64e     9F41CAAB-FDF1-3A02-BD72-0C9CE50D0AC1
0x180068000     libobjc.A.dylib                              arm64e     A6716887-054E-32EE-8B87-A87811AA3599
0x180179000     libdispatch.dylib                            arm64e     EF0492A6-8CA5-38F0-97BB-DF9BDB54C17A
0x104edc000     IBGInvalidFramework                          arm64e     3ED7910B-B39A-4F15-9905-CAA6FA8228B3
0x104edc000     IBGInvalidFramework                          arm64e     2846A6A2-7990-4476-AEF9-743163D5E359
0x104edc000     IBGInvalidFramework                          arm64e     7299396E-15AC-4F65-8B1A-1293603C6DEB
0x184800000     CFNetwork                                    arm64e     4A0921B7-6BD8-3DD0-A7B0-17D82DBBC75A
```
