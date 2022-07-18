import {faker} from "@faker-js/faker";

import {AgentManager, candidate_agent_type_} from "../database/managers/agent-manager";
import {candidate_profile_type_, ProfileManager} from "../database/managers/profile-manager";
import {readdirSync} from "fs";
import {dbOperation_type_} from "../database/database-provider";
import path from "path";

function randomCandidate(forename: string = faker.name.firstName(), surname: string = faker.name.lastName()):
    {
        agent: candidate_agent_type_;
        profile: candidate_profile_type_;
    }
{
    let username = faker.internet.userName(forename, surname).toLowerCase();
    let email = faker.internet.email(forename, surname).toLowerCase();

    let password = username, passkey = forename.toLowerCase() + surname.toLowerCase();

    console.log(forename, surname, username, email, password, passkey);

    return {
        agent:
            {username, email, password, passkey},
        profile:
            {
                forename,
                surname,
                birthdate: faker.date.past().toISOString(),
                location: faker.address.latitude() + "," + faker.address.longitude(),
                avatar_url: path.join("avatar", faker.helpers.arrayElement(readdirSync(__dirname + "/../depot/avatar")))
            }
    }
}

export async function createOne(agentManager: AgentManager, profileManager: ProfileManager): Promise<dbOperation_type_<never>>
{
    let candidate_ = randomCandidate();

    let dbOperation_agent = await agentManager.insertAgent(candidate_.agent);

    if (dbOperation_agent.payload)
    {
        let dbOperation_profile = await profileManager.insertProfile(candidate_.profile, dbOperation_agent.payload.id);

        if (!dbOperation_profile)
            return {error: "profileManager"}
        else
            return {error: ""}
    } else
        return {error: "agentManager"}
}

export async function createMany(agentManager: AgentManager, profileManager: ProfileManager, cardinality: number): Promise<dbOperation_type_<never>[] | null>
{
    // return Promise.all(Array(cardinality).fill(0).map(value => createOne(agentManager, profileManager)));

    for (let i_ = 0; i_ < cardinality; i_++)
    {
        let dbOperation = await createOne(agentManager, profileManager);

        if (!dbOperation.payload)
        {
            console.log(dbOperation.error);
        }
    }

    return null;
}


export async function seedDatabase(agentManager: AgentManager, profileManager: ProfileManager, cardinality: number = 0x04)
{
    await agentManager.delete_all();
    await profileManager.delete_all();

    await createMany(agentManager, profileManager, cardinality);
}
