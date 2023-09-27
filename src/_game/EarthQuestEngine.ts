import { Engine } from "../core/Engine";
import { SceneManager } from "../systems/SceneManager";
import { EarthQuestSceneManager } from "./EarthQuestSceneManager";


export class EarthQuestEngine extends Engine {

    createSceneManager(): SceneManager {
        return new EarthQuestSceneManager(this);
    }
}