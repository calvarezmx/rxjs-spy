/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/rxjs-spy
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { Subject } from "rxjs";
import * as sinon from "sinon";
import { patch } from "../factory";
import { Patcher } from "../patcher";
import { CyclePlugin } from "./cycle-plugin";
import { StackTracePlugin } from "./stack-trace-plugin";

const options = {
    defaultPlugins: false,
    warning: false
};

describe("CyclePlugin", () => {

    let patcher: Patcher;
    let stubs: Record<string, sinon.SinonStub>;

    beforeEach(() => {

        stubs = {
            error: sinon.stub(),
            log: sinon.stub(),
            warn: sinon.stub()
        };
        patcher = patch({ ...options, defaultLogger: stubs as any });
        patcher.pluginHost.plug(new StackTracePlugin({ pluginHost: patcher.pluginHost }));
        patcher.pluginHost.plug(new CyclePlugin({
            cycleThreshold: 1,
            pluginHost: patcher.pluginHost
        }));
    });

    it("should detect cyclic next notifications", () => {

        const subject1 = new Subject<number>();
        const subject2 = new Subject<number>();

        subject1.subscribe(value => {
            if (value < 10) {
                subject2.next(value + 1);
            }
        });
        subject2.subscribe(value => {
            if (value < 10) {
                subject1.next(value + 1);
            }
        });
        subject1.next(0);

        expect(stubs.warn).to.have.property("calledOnce", true);
        const [message] = stubs.warn.firstCall.args;
        expect(message).to.match(/^Cyclic next detected/);
        expect(message).to.match(/name = subject/);
        expect(message).to.match(/value = \d+/);
        expect(message).to.match(/subscribed at\n/);
        expect(message).to.match(/cycle-plugin-spec\.(js|ts)/);
    });

    afterEach(() => {

        if (patcher) {
            patcher.teardown();
        }
    });
});