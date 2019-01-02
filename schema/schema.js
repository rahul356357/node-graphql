    const graphql = require('graphql');
    const _ = require('lodash')
    const axios = require('axios')
    const {
        GraphQLObjectType,
        GraphQLString,
        GraphQLInt,
        GraphQLSchema,
        GraphQLList,
        GraphQLNonNull
    } = graphql;
    //order of defintion
    const CompanyType = new GraphQLObjectType({
        name: 'Company',
        // pass as an reference function is registered but not executed
        fields: () => ({
            id: { type: GraphQLString },
            name: { type: GraphQLString },
            description: { type: GraphQLString },
            users: {
                type: new GraphQLList(UserType),
                resolve(parentValue, args) {
                    return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                        .then(res => res.data)
                }
            }
        })
    })

    UserType = new GraphQLObjectType({
        name: 'User',
        fields: {
            id: { type: GraphQLString },
            firstName: { type: GraphQLString },
            age: { type: GraphQLInt },
            company: {
                type: CompanyType,
                resolve(parentValue, args) {
                    // parentValue return current object
                    return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                        .then(res => res.data)
                }
            }
        }
    })

    const RootQuery = new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            user: {
                type: UserType,
                args: { id: { type: GraphQLInt } },
                //parent value not ever really used it 
                //args --> like id will be provided here as args to the resolve function
                resolve(parentValue, args) {
                    // must return a user data object
                    // can work in async and return a promise
                    return axios.get(`http://localhost:3000/users/${args.id}`)
                        .then(res => res.data)
                }
            },
            company: {
                type: CompanyType,
                args: { id: { type: GraphQLString } },
                resolve(parentValue, args) {
                    return axios.get(`http://localhost:3000/companies/${args.id}`)
                        .then(res => res.data)
                }
            }
        }
    })

    const mutation = new GraphQLObjectType({
        name: 'Mutation',
        //fields as a function
        fields: {
            addUser: {
                // type should be same as type
                type: UserType,
                //args data bef
                args: {
                    firstName: { type: new GraphQLNonNull(GraphQLString) },
                    age: { type: new GraphQLNonNull(GraphQLInt) },
                    companyId: { type: GraphQLString }
                },
                resolve(parentValue, { firstName, age, companyId }) {
                    return axios.post('http://localhost:3000/users', { firstName, age, companyId })
                        .then(res => res.data)
                }
            },
            deleteUser: {
                type: UserType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLString) }
                },
                resolve(parentValue, { id }) {
                    return axios.delete(`http://localhost:3000/users/${id}`)
                        .then(res => res.data)
                }
            },
            editUser: {
                type: UserType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLString) },
                    firstName: { type: new GraphQLNonNull(GraphQLString) },
                   
                },
                resolve(parentValue, { id, firstName }) {
                    return axios.patch(`http://localhost:3000/users/${id}`, { firstName, id })
                    .then(r => r.data)
                }
            },
        }
    })
    module.exports = new GraphQLSchema({
        query: RootQuery,
        mutation: mutation
    })

