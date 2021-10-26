import generateClients from "./generateClients";

describe('generateClients', () => {
  it('should generate frontend and internal clients', () => {
    process.env.SERVICE_NAMESPACE = 'default';
    generateClients();
  })
})
