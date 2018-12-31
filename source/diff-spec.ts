/**
 * @license Use of this source code is governed by an MIT-style license that
 * can be found in the LICENSE file at https://github.com/cartant/rxjs-spy
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import * as sinon from "sinon";
import { diff, hook } from "./diff";

describe("diff", () => {

    it("should do nothing if there is no hook", () => {

        diff("");
    });

    it("should call the registered hook", () => {

        const stub = sinon.stub();

        hook(stub);
        diff("");

        expect(stub).to.have.property("calledOnce", true);
        expect(stub.calledWith("")).to.be.true;
    });

    afterEach(() => {

        hook(undefined);
    });
});