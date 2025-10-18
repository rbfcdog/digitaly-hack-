import { Request, Response } from "express";

export class ActionsController {

    static async foo(req: Request, res: Response) {
        res.status(200).json({ message: "foo" });
    }

}