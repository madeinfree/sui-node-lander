import { useEffect, useState } from 'react'
import axios from 'axios'
import Head from 'next/head'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Table from 'react-bootstrap/Table'

export default function Home() {
  const currentVersion = '0.15.1'
  const [devnet, setDevnet] = useState({
    totalTransactions: 0,
  })
  const [nodes, setNodes] = useState([
    {
      owner: '0x2a8843aCa9854C1c05072D795eeC9acC70e2A557',
      ip: '172.104.82.243',
      version: '0.0.0',
      totalTransactions: 0,
      last: false,
      isUpdated: false,
      isOwnerVerify: true,
    },
    {
      owner: '0x05EE44A05A48104773b66B2d4481E64Ef355c85d',
      ip: '139.162.108.191',
      version: '0.0.0',
      totalTransactions: 0,
      last: false,
      isUpdated: false,
      isOwnerVerify: false,
    },
    {
      owner: '0x77A2c36CE7168c9CD44387fD41F339e6F905457e',
      ip: '172.104.93.137',
      version: '0.0.0',
      totalTransactions: 0,
      last: false,
      isUpdated: false,
      isOwnerVerify: false,
    },
    {
      owner: '0xf652DB8c496C0fC259148327Fa0F3960F466060D',
      ip: '139.162.31.170',
      version: '0.0.0',
      totalTransactions: 0,
      last: false,
      isUpdated: false,
      isOwnerVerify: false,
    },
  ])

  useEffect(() => {
    axios
      .post('https://fullnode.devnet.sui.io/', {
        jsonrpc: '2.0',
        method: 'sui_getTotalTransactionNumber',
        id: 1,
      })
      .then((r) => {
        const { id, result } = r.data
        if (id === 1) {
          setDevnet({
            totalTransactions: result,
          })
        }
      })
      .then(() => {
        fetchAllNodes()
      })
  }, [])

  const fetchAllNodes = async () => {
    const promises = nodes.map(async (node) => {
      try {
        const { data } = await axios.get(
          `https://web-backend.scale3production.com/v1/sui_node_check?url=${node.ip}:9000`
        )
        if (
          data.response.totalTransactions >= devnet.totalTransactions &&
          data.response.nodeVersion === currentVersion
        ) {
          node.isUpdated = true
          node.last = true
          node.version = data.response.nodeVersion
          node.totalTransactions = data.response.totalTransactions
        }
        return node
      } catch {
        return node
      }
    })
    Promise.all(promises).then((nodes) => setNodes(nodes))
  }

  return (
    <div>
      <Head>
        <title>sui node lander</title>
        <meta name="description" content="sui node lander" />
      </Head>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">SUI NODE LANDER</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">所有節點</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container
        style={{
          marginTop: 20,
        }}
      >
        <h2>測試網最新數據</h2>
        <h3>{devnet.totalTransactions}</h3>
        <h2>所有節點</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>位置</th>
              <th>狀態 version, totalTransactions</th>
              <th>擁有者</th>
              <th>擁有者驗證</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((node, index) => (
              <tr key={node.owner}>
                <td>{index + 1}</td>
                <td>{node.ip}</td>
                <td>
                  <span
                    style={{
                      color: node.last ? 'green' : 'red',
                    }}
                  >
                    {node.version} - {node.totalTransactions}
                    {node.totalTransactions < devnet.totalTransactions
                      ? '(同步中)'
                      : '(最新)'}
                  </span>
                </td>
                <td>{node.owner}</td>
                <td>
                  {node.isOwnerVerify ? (
                    <span style={{ color: 'green' }}>已完成驗證</span>
                  ) : (
                    <span>尚未完成驗證</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </div>
  )
}
