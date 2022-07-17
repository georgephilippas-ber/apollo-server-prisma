import {AgentManager, candidate_agent_type_} from "../database/managers/agent-manager";
import {faker} from "@faker-js/faker";
import {dbOperation_type_} from "../database/database-provider";
import {Profile} from "@prisma/client";
import {candidate_profile_type_} from "../database/managers/profile-manager";

function createCandidates(forename: string = faker.name.firstName(), surname: string = faker.name.lastName()):
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
                avatar_url: "" //TODO
            }
    }
}
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
