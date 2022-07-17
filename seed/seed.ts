import {faker} from "@faker-js/faker";

import {AgentManager, candidate_agent_type_} from "../database/managers/agent-manager";
import {candidate_profile_type_, ProfileManager} from "../database/managers/profile-manager";
import {readdirSync} from "fs";
import {dbOperation_type_} from "../database/database-provider";

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
                avatar_url: faker.helpers.arrayElement(readdirSync(__dirname + "/depot/avatar")) //TODO
            }
    }
}

export async function createRandomAgentAndProfile(agentManager: AgentManager, profileManager: ProfileManager): Promise<dbOperation_type_<any>>
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

//TODO: finish here and ProfileResolvers
//
//
// export async function createAgentRandom(agentManager: AgentManager): Promise<dbOperation_type_<Profile>
// {
//
//     return agentManager.insertAgent(candidateAgentRandom());
// }
//
// export async function createManyAgentRandom(agentManager: AgentManager, cardinality: number): Promise<dbOperation_type_[]>
// {
//     return Promise.all(Array(cardinality).fill(0).map(value => createAgentRandom(agentManager)));
// }
//
// export async function seedDatabase(agentManager: AgentManager, cardinality: number = 0x04)
// {
//     await agentManager.delete_all();
//
//     (await createManyAgentRandom(agentManager, cardinality)).filter(value => value.error).forEach(value => console.log(value.error));
// }
